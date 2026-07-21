'use strict';

import { formatCurrency } from './theme.js';
import { translate, translateCategory } from './translations.js';

let currentCurrency = 'USD';
let currentExchangeRate = 15000;
let navigateTo = null;
let showToast = null;
let dashboardChart = null;

export function setDashboardExchangeRate(rate) {
  currentExchangeRate = Number(rate) || 15000;
}

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

function appendSYPEquivalent(parentElement, usdAmount) {
  const oldEquivalent = parentElement.parentNode.querySelector('.syp-equivalent');
  if (oldEquivalent) {
    oldEquivalent.remove();
  }

  if (currentCurrency === 'USD' && currentExchangeRate > 0) {
    const sypValue = usdAmount * currentExchangeRate;
    const formatted = formatCurrency(sypValue, 'SYP');
    const el = document.createElement('div');
    el.className = 'syp-equivalent text-xs text-secondary mt-1';
    el.style.fontSize = 'var(--text-xs)';
    el.style.color = 'var(--color-text-secondary)';
    el.style.marginTop = 'var(--space-1)';
    el.textContent = `≈ ${formatted}`;
    parentElement.parentNode.insertBefore(el, parentElement.nextSibling);
  }
}

function renderDashboardSummary(stats) {
  const balanceEl = document.getElementById('stat-balance');
  const incomeEl = document.getElementById('stat-income');
  const expensesEl = document.getElementById('stat-expenses');
  const countEl = document.getElementById('stat-count');

  if (balanceEl) {
    balanceEl.textContent = formatCurrency(stats.balance, currentCurrency);
    appendSYPEquivalent(balanceEl, stats.balance);
  }
  if (incomeEl) {
    incomeEl.textContent = formatCurrency(stats.totalIncome, currentCurrency);
    appendSYPEquivalent(incomeEl, stats.totalIncome);
  }
  if (expensesEl) {
    expensesEl.textContent = formatCurrency(stats.totalExpenses, currentCurrency);
    appendSYPEquivalent(expensesEl, stats.totalExpenses);
  }
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
            label: (context) => `${translateCategory(context.label)}: ${formatCurrency(context.parsed, currentCurrency)}`,
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
        <span class="chart-legend__label">${translateCategory(row.category)}</span>
        <span class="chart-legend__value">${formatCurrency(row.total, currentCurrency)}</span>
      </div>
    `;
  }).join('');
}

function formatTransactionAmount(tx, baseCurrency) {
  const txCurrency = tx.currency || 'USD';
  const txRate = tx.exchange_rate || 1.0;
  const amount = tx.amount;
  const typeClass = tx.type === 'income' ? 'income' : 'expense';

  if (baseCurrency === 'USD') {
    if (txCurrency === 'USD') {
      const primary = formatCurrency(amount, 'USD');
      const sypVal = amount * txRate;
      const secondary = txRate > 1 ? `<span class="syp-equivalent-block text-xs text-secondary d-block mt-1">≈ ${formatCurrency(sypVal, 'SYP')}</span>` : '';
      return `<span class="amount amount--${typeClass}">${primary}</span>${secondary}`;
    } else {
      const usdVal = amount / txRate;
      const primary = formatCurrency(usdVal, 'USD');
      const secondary = `<span class="syp-equivalent-block text-xs text-secondary d-block mt-1">(${formatCurrency(amount, 'SYP')})</span>`;
      return `<span class="amount amount--${typeClass}">${primary}</span>${secondary}`;
    }
  } else if (baseCurrency === 'SYP') {
    if (txCurrency === 'SYP') {
      const primary = formatCurrency(amount, 'SYP');
      return `<span class="amount amount--${typeClass}">${primary}</span>`;
    } else {
      const sypVal = amount * txRate;
      const primary = formatCurrency(sypVal, 'SYP');
      const secondary = `<span class="syp-equivalent-block text-xs text-secondary d-block mt-1">(${formatCurrency(amount, 'USD')})</span>`;
      return `<span class="amount amount--${typeClass}">${primary}</span>${secondary}`;
    }
  } else {
    return `<span class="amount amount--${typeClass}">${formatCurrency(amount, baseCurrency)}</span>`;
  }
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
    const label = tx.type === 'income' ? translate('type_income') : translate('type_expense');
    const categoryText = tx.type === 'expense' ? translateCategory(tx.category) : '—';

    return `
      <div class="transaction-row">
        <div class="transaction-row__main">
          <div class="transaction-row__title">${tx.title}</div>
          <div class="transaction-row__meta">
            <span>${tx.date}</span>
            <span>${categoryText}</span>
          </div>
        </div>
        <div class="transaction-row__status" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
          <span class="type-badge ${typeClass}">${label}</span>
          ${formatTransactionAmount(tx, currentCurrency)}
        </div>
      </div>
    `;
  }).join('');
}

export async function loadDashboard() {
  const statsResult = await window.api.getStatistics();
  if (!statsResult.success) {
    if (showToast) showToast(translate('msg_settings_load_error'), 'error');
    return;
  }

  const recentResult = await window.api.getRecentTransactions();
  if (!recentResult.success) {
    if (showToast) showToast(translate('msg_settings_load_error'), 'error');
    return;
  }

  const stats = statsResult.data;
  renderDashboardSummary(stats);
  renderDashboardChart(stats.expensesByCategory);
  renderRecentTransactions(recentResult.data);
}
