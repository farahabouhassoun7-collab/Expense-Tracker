'use strict';

import { formatCurrency } from './theme.js';

let currentCurrency = 'USD';
let navigateTo = null;
let showToast = null;
let dashboardChart = null;

const categoryColorVariables = {
  Food: '--chart-food',
  Transport: '--chart-transport',
  Shopping: '--chart-shopping',
  Bills: '--chart-bills',
  Entertainment: '--chart-entertainment',
  Healthcare: '--chart-healthcare',
  Other: '--chart-other',
};

function getCategoryColor(category) {
  const cssVar = categoryColorVariables[category] || '--chart-other';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim() || '#78909C';
}

export function initDashboard({ navigate, showToast: notify }) {
  navigateTo = navigate;
  showToast = notify;

  const viewAllButton = document.getElementById('btn-view-all');
  if (viewAllButton) {
    viewAllButton.addEventListener('click', () => {
      if (navigateTo) navigateTo('transactions');
    });
  }
}

export function setDashboardCurrency(currency) {
  currentCurrency = currency;
}

function renderDashboardSummary(stats) {
  const balanceEl = document.getElementById('stat-balance');
  const incomeEl = document.getElementById('stat-income');
  const expensesEl = document.getElementById('stat-expenses');
  const countEl = document.getElementById('stat-count');

  if (balanceEl) balanceEl.textContent = formatCurrency(stats.balance, currentCurrency);
  if (incomeEl) incomeEl.textContent = formatCurrency(stats.totalIncome, currentCurrency);
  if (expensesEl) expensesEl.textContent = formatCurrency(stats.totalExpenses, currentCurrency);
  if (countEl) countEl.textContent = String(stats.transactionCount);
}

function renderDashboardChart(expensesByCategory) {
  const canvas = document.getElementById('dashboardChart');
  const legendContainer = document.getElementById('dashboard-chart-legend');
  const emptyState = document.getElementById('dashboard-chart-empty');

  if (!canvas || !legendContainer || !emptyState) return;

  const hasData = Array.isArray(expensesByCategory) && expensesByCategory.length > 0;

  if (dashboardChart) {
    dashboardChart.destroy();
    dashboardChart = null;
  }

  if (!hasData) {
    canvas.classList.add('hidden');
    emptyState.classList.remove('hidden');
    legendContainer.innerHTML = '';
    return;
  }

  canvas.classList.remove('hidden');
  emptyState.classList.add('hidden');

  const labels = expensesByCategory.map((row) => row.category);
  const data = expensesByCategory.map((row) => row.total);
  const backgroundColor = expensesByCategory.map((row) => getCategoryColor(row.category));

  dashboardChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${formatCurrency(context.parsed, currentCurrency)}`,
          },
        },
      },
    },
  });

  legendContainer.innerHTML = expensesByCategory.map((row) => {
    const color = getCategoryColor(row.category);
    return `
      <div class="chart-legend__item">
        <span class="chart-legend__dot" style="background:${color}"></span>
        <span class="chart-legend__label">${row.category}</span>
        <span class="chart-legend__value">${formatCurrency(row.total, currentCurrency)}</span>
      </div>
    `;
  }).join('');
}

function renderRecentTransactions(transactions) {
  const listEl = document.getElementById('recent-transactions-list');
  const emptyState = document.getElementById('recent-transactions-empty');

  if (!listEl || !emptyState) return;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    listEl.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  listEl.innerHTML = transactions.map((tx) => {
    const typeClass = tx.type === 'income' ? 'type-badge--income' : 'type-badge--expense';
    const label = tx.type === 'income' ? 'Income' : 'Expense';
    const categoryText = tx.type === 'expense' ? tx.category : '—';

    return `
      <div class="transaction-row">
        <div class="transaction-row__main">
          <div class="transaction-row__title">${tx.title}</div>
          <div class="transaction-row__meta">
            <span>${tx.date}</span>
            <span>${categoryText}</span>
          </div>
        </div>
        <div class="transaction-row__status">
          <span class="type-badge ${typeClass}">${label}</span>
          <span class="amount amount--${tx.type === 'income' ? 'income' : 'expense'}">${formatCurrency(tx.amount, currentCurrency)}</span>
        </div>
      </div>
    `;
  }).join('');
}

export async function loadDashboard() {
  const statsResult = await window.api.getStatistics();
  if (!statsResult.success) {
    if (showToast) showToast('Failed to load dashboard statistics.', 'error');
    return;
  }

  const recentResult = await window.api.getRecentTransactions();
  if (!recentResult.success) {
    if (showToast) showToast('Failed to load recent transactions.', 'error');
    return;
  }

  const stats = statsResult.data;
  renderDashboardSummary(stats);
  renderDashboardChart(stats.expensesByCategory);
  renderRecentTransactions(recentResult.data);
}
