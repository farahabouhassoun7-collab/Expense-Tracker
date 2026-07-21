'use strict';

import { initDashboard, setDashboardCurrency, loadDashboard, setDashboardExchangeRate } from './dashboard.js';
import { initTransactions, setTransactionsCurrency, loadTransactions, setTransactionsExchangeRate } from './transactions.js';
import { initStatistics, setStatisticsCurrency, loadStatistics } from './statistics.js';
import { initSettings, loadSettings, updateExchangeRate } from './settings.js';
import { validateForm } from './form-validator.js';
import { applyTheme, getCurrencySymbol } from './theme.js';
import { applyLanguage, translate } from './translations.js';

// ──────────────────────────────────────────────────────────────────────────
// GLOBAL STATE & REFERENCES
// ──────────────────────────────────────────────────────────────────────────

/** @type {string} Currently active page ID */
let activePage = 'dashboard';

/** @type {object | null} Settings cache */
let currentSettings = null;

/** @type {Window['api']} Electron IPC bridge */
const { api } = window;

/** @type {HTMLElement | null} Main content area */
const contentArea = document.getElementById('content-area');

/** @type {HTMLElement | null} Page title element */
const pageTitle = document.getElementById('page-title');

/** @type {HTMLElement | null} Modal overlay */
const modalOverlay = document.getElementById('modal-overlay');

/** @type {HTMLElement | null} Modal form */
const modalForm = document.getElementById('modal-form');

/** @type {HTMLElement | null} Toast container */
const toastContainer = document.getElementById('toast-container');

/** @type {HTMLElement | null} Toast element */
const toast = document.getElementById('toast');

/** @type {NodeListOf<HTMLButtonElement>} All navigation buttons */
const navButtons = document.querySelectorAll('.nav-item');

// ──────────────────────────────────────────────────────────────────────────
// PAGE NAVIGATION (Task 23)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Shows a specific page and updates navigation state.
 *
 * @param {string} pageId - One of: 'dashboard', 'transactions', 'statistics', 'settings'
 */
async function showPage(pageId) {
  // Validate page ID
  const validPages = ['dashboard', 'transactions', 'statistics', 'settings'];
  if (!validPages.includes(pageId)) {
    console.error(`Invalid page ID: ${pageId}`);
    return;
  }

  // 1. Hide all page sections
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.add('hidden');
    section.setAttribute('hidden', '');
  });

  // 2. Remove active class from all nav buttons
  navButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.removeAttribute('aria-current');
  });

  // 3. Show the target page
  const targetPage = document.getElementById(`page-${pageId}`);
  const targetNavButton = document.getElementById(`nav-${pageId}`);

  if (targetPage) {
    targetPage.classList.remove('hidden');
    targetPage.removeAttribute('hidden');
  } else {
    console.error(`Page element not found: #page-${pageId}`);
  }

  if (targetNavButton) {
    targetNavButton.classList.add('active');
    targetNavButton.setAttribute('aria-current', 'page');
  }

  // 4. Update page title
  if (pageTitle) {
    const titles = {
      dashboard: translate('nav_dashboard'),
      transactions: translate('nav_transactions'),
      statistics: translate('nav_statistics'),
      settings: translate('nav_settings'),
    };
    pageTitle.textContent = titles[pageId] || translate('nav_dashboard');
  }

  // 5. Update global state
  activePage = pageId;

  // 6. Load data for the active page
  await loadActivePageData();

  // 7. Notify any page-specific module that the page is now visible
  dispatchEvent(new CustomEvent('pageChanged', { detail: pageId }));
}

/**
 * Loads data for the currently active page.
 */
async function loadActivePageData() {
  try {
    if (activePage === 'dashboard') {
      await loadDashboard();
    } else if (activePage === 'transactions') {
      await loadTransactions();
    } else if (activePage === 'statistics') {
      await loadStatistics();
    } else if (activePage === 'settings') {
      await loadSettings();
    }
  } catch (err) {
    console.error(`Failed to load data for page ${activePage}:`, err);
  }
}

/**
 * Refreshes settings, updates currency across modules, and re-renders active page data.
 */
async function refreshActivePage() {
  try {
    const settings = await loadSettings();
    if (settings) {
      currentSettings = settings;
      setDashboardCurrency(settings.currency);
      setTransactionsCurrency(settings.currency);
      setStatisticsCurrency(settings.currency);

      setDashboardExchangeRate(settings.usd_to_syp_rate || 15000);
      setTransactionsExchangeRate(settings.usd_to_syp_rate || 15000);

      const rateInput = document.getElementById('usd-to-syp-rate-input');
      if (rateInput) {
        rateInput.value = settings.usd_to_syp_rate || 15000;
      }
      const exRateCard = document.getElementById('exchange-rate-card');
      if (exRateCard) {
        exRateCard.classList.toggle('hidden', settings.currency !== 'USD');
      }

      const prefixElement = document.getElementById('modal-amount-prefix');
      if (prefixElement) {
        prefixElement.textContent = getCurrencySymbol(settings.currency);
      }
    }
    await loadActivePageData();
  } catch (err) {
    console.error('Failed to refresh active page:', err);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// MODAL MANAGEMENT (Task 25 - basic skeleton)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Opens the shared modal for adding or editing a transaction.
 *
 * @param {'income' | 'expense'} type - Transaction type.
 * @param {object} [data] - Existing record data (for edit mode).
 */
function openModal(type, data = null) {
  if (!modalOverlay || !modalForm) {
    console.error('Modal elements not found');
    return;
  }

  // Update modal title
  const titleEl = document.getElementById('modal-title');
  if (titleEl) {
    const isEdit = !!data;
    if (isEdit) {
      titleEl.textContent = type === 'income' ? translate('modal_title_edit_income') : translate('modal_title_edit_expense');
    } else {
      titleEl.textContent = type === 'income' ? translate('modal_title_add_income') : translate('modal_title_add_expense');
    }
  }

  // Show/hide category field based on type
  const categoryGroup = document.getElementById('modal-category-group');
  if (categoryGroup) {
    categoryGroup.classList.toggle('hidden', type === 'income');
  }

  // Pre-fill form for edit mode
  if (data) {
    document.getElementById('modal-id').value = data.id || '';
    document.getElementById('modal-type').value = type;

    // Fill text inputs
    const titleInput = document.getElementById('modal-title-input');
    const amountInput = document.getElementById('modal-amount-input');
    const dateInput = document.getElementById('modal-date-input');
    const noteInput = document.getElementById('modal-note-textarea');
    const currencySelect = document.getElementById('modal-currency-select');
    const exchangeRateInput = document.getElementById('modal-exchange-rate-input');

    if (titleInput) titleInput.value = data.title || '';
    if (amountInput) amountInput.value = data.amount || '';
    if (dateInput) dateInput.value = data.date || '';
    if (noteInput) noteInput.value = data.note || '';
    if (currencySelect) currencySelect.value = data.currency || 'USD';
    if (exchangeRateInput) exchangeRateInput.value = data.exchange_rate || 15000;

    // Fill category for expenses
    if (type === 'expense') {
      const categorySelect = document.getElementById('modal-category-select');
      if (categorySelect) categorySelect.value = data.category || '';
    }

    // Set dynamic amount prefix symbol
    const symbol = getCurrencySymbol(data.currency || 'USD');
    const prefixEl = document.getElementById('modal-amount-prefix');
    if (prefixEl) prefixEl.textContent = symbol;
  } else {
    // Clear form for add mode
    modalForm.reset();
    document.getElementById('modal-id').value = '';
    document.getElementById('modal-type').value = type;
    document.getElementById('modal-date-input').value = new Date().toISOString().split('T')[0];

    const currencySelect = document.getElementById('modal-currency-select');
    const exchangeRateInput = document.getElementById('modal-exchange-rate-input');
    if (currencySelect && currentSettings) currencySelect.value = currentSettings.currency || 'USD';
    if (exchangeRateInput && currentSettings) exchangeRateInput.value = currentSettings.usd_to_syp_rate || 15000;

    // Set dynamic amount prefix symbol
    const symbol = getCurrencySymbol((currentSettings && currentSettings.currency) || 'USD');
    const prefixEl = document.getElementById('modal-amount-prefix');
    if (prefixEl) prefixEl.textContent = symbol;
  }

  // Clear any previous error messages
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
  });

  // Show modal
  modalOverlay.classList.remove('hidden');
  modalOverlay.setAttribute('aria-hidden', 'false');

  // Focus the first input
  const firstInput = document.getElementById('modal-title-input');
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

/**
 * Closes the modal and clears the form.
 */
function closeModal() {
  if (!modalOverlay || !modalForm) return;

  modalOverlay.classList.add('hidden');
  modalOverlay.setAttribute('aria-hidden', 'true');
  modalForm.reset();
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
  });
}

// ──────────────────────────────────────────────────────────────────────────
// TOAST NOTIFICATION (Task 38 - basic skeleton)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Shows a toast notification.
 *
 * @param {string} message - Message to display.
 * @param {'success' | 'error'} [type='success'] - Toast type.
 */
function showToast(message, type = 'success') {
  if (!toastContainer || !toast) {
    console.error('Toast elements not found');
    return;
  }

  const toastMessage = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  if (toastMessage) toastMessage.textContent = message;

  // Set icon based on type
  if (toastIcon) {
    toastIcon.className = 'toast__icon';
    toastIcon.classList.add(`toast__icon--${type}`);
  }

  // Remove any existing toast
  toast.classList.remove('success', 'error', 'visible');
  toast.classList.add(type, 'visible');

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// ──────────────────────────────────────────────────────────────────────────
// EVENT HANDLERS
// ──────────────────────────────────────────────────────────────────────────

/**
 * Attaches event listeners to navigation buttons.
 */
function setupNavigation() {
  navButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const page = event.currentTarget.getAttribute('data-page');
      if (page) showPage(page);
    });
  });
}

/**
 * Attaches event listeners to theme toggle buttons.
 */
function setupThemeToggles() {
  // Sidebar theme toggle
  const lightBtn = document.getElementById('theme-light');
  const darkBtn = document.getElementById('theme-dark');
  const settingsLightBtn = document.getElementById('settings-theme-light');
  const settingsDarkBtn = document.getElementById('settings-theme-dark');

  const setTheme = (theme) => {
    applyTheme(theme);
    if (api) {
      api.updateSettings({ theme }).catch(err => {
        console.error('Failed to update theme in settings:', err);
      });
    }
  };

  if (lightBtn) {
    lightBtn.addEventListener('click', () => setTheme('light'));
  }

  if (darkBtn) {
    darkBtn.addEventListener('click', () => setTheme('dark'));
  }

  if (settingsLightBtn) {
    settingsLightBtn.addEventListener('click', () => setTheme('light'));
  }

  if (settingsDarkBtn) {
    settingsDarkBtn.addEventListener('click', () => setTheme('dark'));
  }
}

/**
 * Attaches event listeners to modal elements.
 */
function setupModal() {
  const modalCancel = document.getElementById('modal-cancel');
  const modalClose = document.getElementById('modal-close');

  // Close modal on cancel button, close button, or backdrop click
  if (modalCancel) {
    modalCancel.addEventListener('click', closeModal);
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
      if (event.target === modalOverlay) {
        closeModal();
      }
    });
  }

  const currencySelect = document.getElementById('modal-currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      const symbol = getCurrencySymbol(currencySelect.value);
      const prefixEl = document.getElementById('modal-amount-prefix');
      if (prefixEl) prefixEl.textContent = symbol;
    });
  }

  // Validate and handle form submission
  if (modalForm) {
    modalForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Gather form inputs
      const idStr = document.getElementById('modal-id').value;
      const type = document.getElementById('modal-type').value;
      const title = document.getElementById('modal-title-input').value;
      const amountStr = document.getElementById('modal-amount-input').value;
      const category = document.getElementById('modal-category-select').value;
      const date = document.getElementById('modal-date-input').value;
      const note = document.getElementById('modal-note-textarea').value;
      const currency = document.getElementById('modal-currency-select').value;
      const exchangeRateStr = document.getElementById('modal-exchange-rate-input').value;

      const id = idStr ? Number(idStr) : null;
      const amount = Number(amountStr);
      const exchange_rate = Number(exchangeRateStr) || 1.0;

      const formData = {
        title,
        amount: amountStr,
        category,
        date,
        note,
      };

      // Clear previous error messages
      document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
      });

      // Run client-side validation
      const validation = validateForm(formData, type);
      if (!validation.valid) {
        // Display inline errors
        for (const [field, message] of Object.entries(validation.errors)) {
          const errorEl = document.getElementById(`error-${field}`);
          if (errorEl) {
            let translatedMsg = message;
            if (field === 'title') translatedMsg = translate('msg_invalid_title');
            else if (field === 'amount') translatedMsg = translate('msg_invalid_amount');
            else if (field === 'category') translatedMsg = translate('msg_invalid_category');
            else if (field === 'date') translatedMsg = translate('msg_invalid_date');
            errorEl.textContent = translatedMsg;
          }
        }
        return;
      }

      // Prepare payload
      const payload = {
        title: title.trim(),
        amount,
        date,
        note: note.trim() || null,
        currency,
        exchange_rate,
      };
      if (type === 'expense') {
        payload.category = category;
      }

      let response;
      if (id !== null) {
        // Edit mode
        if (type === 'income') {
          response = await api.updateIncome(id, payload);
        } else {
          response = await api.updateExpense(id, payload);
        }
      } else {
        // Add mode
        if (type === 'income') {
          response = await api.addIncome(payload);
        } else {
          response = await api.addExpense(payload);
        }
      }

      if (response && response.success) {
        showToast(
          id !== null
            ? translate('msg_edit_success')
            : translate('msg_add_success'),
          'success'
        );
        closeModal();
        await refreshActivePage();
      } else {
        const errorMsg = response ? response.error : translate('msg_unknown');
        showToast(errorMsg, 'error');
      }
    });
  }
}

/**
 * Attaches event listeners to add transaction buttons.
 */
function setupAddButtons() {
  const addIncomeBtn = document.getElementById('btn-add-income');
  const addExpenseBtn = document.getElementById('btn-add-expense');

  if (addIncomeBtn) {
    addIncomeBtn.addEventListener('click', () => openModal('income'));
  }

  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => openModal('expense'));
  }
}

/**
 * Attaches event listeners to toast close button.
 */
function setupToast() {
  const toastClose = document.getElementById('toast-close');
  if (toastClose) {
    toastClose.addEventListener('click', () => {
      if (toast) toast.classList.remove('visible');
    });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ──────────────────────────────────────────────────────────────────────────

/**
 * Initializes the application.
 */
async function initApp() {

  // 1. Setup all event listeners
  setupNavigation();
  setupThemeToggles();
  setupModal();
  setupAddButtons();
  setupToast();

  // 2. Load initial settings and apply theme
  try {
    if (api) {
      // Initialize submodules with callbacks
      initDashboard({ navigate: showPage, showToast });
      initTransactions({ openModal, showToast, refreshPage: refreshActivePage });
      initStatistics({ showToast });
      initSettings({ showToast, refreshPage: refreshActivePage });

      const settings = await loadSettings();
      if (settings) {
        currentSettings = settings;
        setDashboardCurrency(settings.currency);
        setTransactionsCurrency(settings.currency);
        setStatisticsCurrency(settings.currency);
        setDashboardExchangeRate(settings.usd_to_syp_rate || 15000);
        setTransactionsExchangeRate(settings.usd_to_syp_rate || 15000);
        applyTheme(settings.theme);
        applyLanguage(settings.language || 'en');

        const rateInput = document.getElementById('usd-to-syp-rate-input');
        if (rateInput) {
          rateInput.value = settings.usd_to_syp_rate || 15000;
          rateInput.addEventListener('change', async () => {
            const rate = Number(rateInput.value) || 0;
            await updateExchangeRate(rate);
            if (showToast) showToast(translate('msg_rate_updated'), 'success');
            await refreshActivePage();
          });
        }
        const exRateCard = document.getElementById('exchange-rate-card');
        if (exRateCard) {
          exRateCard.classList.toggle('hidden', settings.currency !== 'USD');
        }
      }
    }
  } catch (err) {
    console.error('Failed to load initial settings:', err);
  }

  // 3. Show dashboard as default page
  await showPage('dashboard');
}

// ──────────────────────────────────────────────────────────────────────────
// DOM READY
// ──────────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
