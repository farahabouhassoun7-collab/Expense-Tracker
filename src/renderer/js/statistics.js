'use strict';

import { formatCurrency } from './theme.js';

let categoryChart = null;
let monthlyChart = null;
let currentCurrency = 'USD';
let showToast = null;

function getCategoryColor(category) {
  const mapping = {
    Food: '--chart-food',
    Transport: '--chart-transport',
    Shopping: '--chart-shopping',
    Bills: '--chart-bills',
    Entertainment: '--chart-entertainment',
    Healthcare: '--chart-healthcare',
    Other: '--chart-other',
  };

  const variable = mapping[category] || '--chart-other';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || '#78909C';
}

export function setStatisticsCurrency(currency) {
  currentCurrency = currency;
}

export function initStatistics({ showToast: notify }) {
  showToast = notify;
}

function renderStatCards(stats) {
  const incomeEl = document.getElementById('stats-total-income');
  const expensesEl = document.getElementById('stats-total-expenses');
  const balanceEl = document.getElementById('stats-balance');

  if (incomeEl) incomeEl.textContent = formatCurrency(stats.totalIncome, currentCurrency);
  if (expensesEl) expensesEl.textContent = formatCurrency(stats.totalExpenses, currentCurrency);
  if (balanceEl) balanceEl.textContent = formatCurrency(stats.balance, currentCurrency);
}

function renderCategoryChart(data) {
  const canvas = document.getElementById('statisticsChart');
  const emptyState = document.getElementById('statistics-chart-empty');

  if (!canvas || !emptyState) return;
  if (categoryChart) {
    categoryChart.destroy();
    categoryChart = null;
  }

  if (!data || data.length === 0) {
    canvas.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  canvas.classList.remove('hidden');
  emptyState.classList.add('hidden');

  const labels = data.map((row) => row.category);
  const values = data.map((row) => row.total);
  const backgroundColor = data.map((row) => getCategoryColor(row.category));

  categoryChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
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
}

function renderMonthlyChart(data) {
  const canvas = document.getElementById('monthlyChart');
  const emptyState = document.getElementById('monthly-chart-empty');

  if (!canvas || !emptyState) return;
  if (monthlyChart) {
    monthlyChart.destroy();
    monthlyChart = null;
  }

  if (!data || data.length === 0) {
    canvas.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  canvas.classList.remove('hidden');
  emptyState.classList.add('hidden');

  const labels = data.map((row) => row.month);
  const values = data.map((row) => row.total);

  monthlyChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Expenses',
        data: values,
        backgroundColor: '#5C6BC0',
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y, currentCurrency),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
            callback: (value) => formatCurrency(value, currentCurrency),
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim(),
          },
        },
      },
    },
  });
}

export async function loadStatistics() {
  const statsResult = await window.api.getStatistics();

  if (!statsResult.success) {
    if (showToast) showToast('Failed to load statistics.', 'error');
    return;
  }

  const stats = statsResult.data;
  renderStatCards(stats);
  renderCategoryChart(stats.expensesByCategory);
  renderMonthlyChart(stats.expensesByMonth);
}
