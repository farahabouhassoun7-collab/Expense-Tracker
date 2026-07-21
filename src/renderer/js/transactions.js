'use strict';

import { formatCurrency } from './theme.js';
import { translate, translateCategory } from './translations.js';

let currentCurrency = 'USD';
let openModal = null;
let showToast = null;
let refreshPage = null;
let allTransactions = [];

function getSelectedFilters() {
  const searchInput = document.getElementById('search-transactions');
  const categorySelect = document.getElementById('filter-category');
  const dateFromInput = document.getElementById('filter-date-from');
  const dateToInput = document.getElementById('filter-date-to');

  return {
    search: searchInput?.value.trim().toLowerCase() || '',
    category: categorySelect?.value || '',
    dateFrom: dateFromInput?.value || '',
    dateTo: dateToInput?.value || '',
  };
}

function applyFilters() {
  const { search, category, dateFrom, dateTo } = getSelectedFilters();
  let filtered = [...allTransactions];

  if (search) {
    filtered = filtered.filter((tx) => {
      const title = String(tx.title || '').toLowerCase();
      const note = String(tx.note || '').toLowerCase();
      return title.includes(search) || note.includes(search);
    });
  }

  if (category) {
    filtered = filtered.filter((tx) => tx.type === 'expense' && tx.category === category);
  }

  if (dateFrom) {
    filtered = filtered.filter((tx) => tx.date >= dateFrom);
  }

  if (dateTo) {
    filtered = filtered.filter((tx) => tx.date <= dateTo);
  }

  renderTransactions(filtered);
}

function renderTransactions(rows) {
  const tbody = document.getElementById('transactions-tbody');
  const emptyState = document.getElementById('transactions-empty');
  const table = document.getElementById('transactions-table');

  if (!tbody || !emptyState || !table) return;

  if (!rows || rows.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    table.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  table.classList.remove('hidden');

  tbody.innerHTML = rows.map((tx) => {
    const typeLabel = tx.type === 'income' ? translate('type_income') : translate('type_expense');
    const typeClass = tx.type === 'income' ? 'type-badge--income' : 'type-badge--expense';
    const categoryText = tx.type === 'expense' ? translateCategory(tx.category) : '';

    return `
      <tr>
        <td>${tx.date}</td>
        <td><span class="type-badge ${typeClass}">${typeLabel}</span></td>
        <td>${tx.title}</td>
        <td>${categoryText}</td>
        <td>${formatCurrency(tx.amount, currentCurrency)}</td>
        <td>
          <button class="btn btn-ghost" data-action="edit" data-id="${tx.id}" data-type="${tx.type}">${translate('btn_edit')}</button>
          <button class="btn btn-ghost" data-action="delete" data-id="${tx.id}" data-type="${tx.type}">${translate('btn_delete')}</button>
        </td>
      </tr>
    `;
  }).join('');
}

export function setTransactionsCurrency(currency) {
  currentCurrency = currency;
}

export function initTransactions({ openModal: modalFn, showToast: notify, refreshPage: refreshFn }) {
  openModal = modalFn;
  showToast = notify;
  refreshPage = refreshFn;

  const searchInput = document.getElementById('search-transactions');
  const searchClear = document.getElementById('search-clear');
  const categorySelect = document.getElementById('filter-category');
  const dateFromInput = document.getElementById('filter-date-from');
  const dateToInput = document.getElementById('filter-date-to');
  const exportButton = document.getElementById('btn-export-csv');
  const transactionsTable = document.getElementById('transactions-table');
  const tbody = document.getElementById('transactions-tbody');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilters();
      if (searchClear) {
        searchClear.classList.toggle('hidden', searchInput.value.trim() === '');
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchClear.classList.add('hidden');
      applyFilters();
    });
  }

  [categorySelect, dateFromInput, dateToInput].forEach((element) => {
    if (element) element.addEventListener('change', applyFilters);
  });

  if (exportButton) {
    exportButton.addEventListener('click', async () => {
      const result = await window.api.exportToCSV();
      if (result.success) {
        if (showToast) showToast(translate('msg_export_success'), 'success');
      } else if (result.cancelled) {
        // User cancelled export, no toast needed.
      } else {
        if (showToast) showToast(`${translate('msg_export_failed')}: ${result.error}`, 'error');
      }
    });
  }

  if (tbody) {
    tbody.addEventListener('click', async (event) => {
      const button = event.target.closest('button');
      if (!button) return;

      const action = button.dataset.action;
      const id = Number(button.dataset.id);
      const type = button.dataset.type;
      if (!action || !id || !type) return;

      const record = allTransactions.find((tx) => tx.id === id && tx.type === type);
      if (!record) return;

      if (action === 'edit') {
        if (openModal) openModal(type, record);
        return;
      }

      if (action === 'delete') {
        const confirmed = window.confirm(translate('msg_confirm_delete'));
        if (!confirmed) return;

        let response;
        if (type === 'income') {
          response = await window.api.deleteIncome(id);
        } else {
          response = await window.api.deleteExpense(id);
        }

        if (!response.success) {
          if (showToast) showToast(`${translate('msg_delete_failed')}: ${response.error}`, 'error');
          return;
        }

        if (showToast) showToast(translate('msg_delete_success'), 'success');
        await loadTransactions();
        if (refreshPage) refreshPage();
      }
    });
  }
}

export async function loadTransactions() {
  const [incomeResult, expenseResult] = await Promise.all([
    window.api.getIncomes(),
    window.api.getExpenses(),
  ]);

  if (!incomeResult.success) {
    if (showToast) showToast(translate('msg_settings_load_error'), 'error');
    return;
  }

  if (!expenseResult.success) {
    if (showToast) showToast(translate('msg_settings_load_error'), 'error');
    return;
  }

  const incomes = incomeResult.data.map((row) => ({ ...row, type: 'income', category: null }));
  const expenses = expenseResult.data.map((row) => ({ ...row, type: 'expense' }));

  allTransactions = [...incomes, ...expenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  applyFilters();
}
