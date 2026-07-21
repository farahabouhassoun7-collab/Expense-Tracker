'use strict';

import { applyTheme, getCurrencySymbol } from './theme.js';
import { applyLanguage, translate } from './translations.js';

let showToast = null;
let refreshPage = null;

function setCurrencyPrefix(currency) {
  const prefix = getCurrencySymbol(currency);
  const prefixElement = document.getElementById('modal-amount-prefix');
  if (prefixElement) prefixElement.textContent = prefix;
}

async function persistSettings(overrides) {
  const currentResult = await window.api.getSettings();
  if (!currentResult.success) {
    if (showToast) showToast(translate('msg_settings_load_error'), 'error');
    return false;
  }

  const payload = {
    currency: overrides.currency ?? currentResult.data.currency,
    theme: overrides.theme ?? currentResult.data.theme,
    language: overrides.language ?? currentResult.data.language,
    usd_to_syp_rate: overrides.usd_to_syp_rate ?? currentResult.data.usd_to_syp_rate,
  };

  const updateResult = await window.api.updateSettings(payload);
  if (!updateResult.success) {
    if (showToast) showToast(`${translate('msg_settings_save_error')}: ${updateResult.error}`, 'error');
    return false;
  }

  return true;
}

export function initSettings({ showToast: notify, refreshPage: refresh }) {
  showToast = notify;
  refreshPage = refresh;

  const currencySelect = document.getElementById('currency-select');
  const languageSelect = document.getElementById('language-select');
  const exportButton = document.getElementById('btn-export-settings');
  const themeButtons = document.querySelectorAll('#settings-theme-light, #settings-theme-dark');

  if (currencySelect) {
    currencySelect.addEventListener('change', async () => {
      const currency = currencySelect.value;
      const saved = await persistSettings({ currency });
      if (!saved) return;
      setCurrencyPrefix(currency);
      if (refreshPage) refreshPage();
      if (showToast) showToast(translate('msg_currency_updated'), 'success');
    });
  }

  if (languageSelect) {
    languageSelect.addEventListener('change', async () => {
      const language = languageSelect.value;
      const saved = await persistSettings({ language });
      if (!saved) return;
      applyLanguage(language);
      if (refreshPage) refreshPage();
      if (showToast) showToast(translate('msg_language_updated'), 'success');
    });
  }

  themeButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const theme = button.id.includes('dark') ? 'dark' : 'light';
      const saved = await persistSettings({ theme });
      if (!saved) return;
      applyTheme(theme);
      if (refreshPage) refreshPage();
      if (showToast) showToast(translate('msg_theme_updated'), 'success');
    });
  });

  if (exportButton) {
    exportButton.addEventListener('click', async () => {
      const result = await window.api.exportToCSV();
      if (result.success) {
        if (showToast) showToast(translate('msg_export_success'), 'success');
      } else if (!result.cancelled) {
        if (showToast) showToast(`${translate('msg_export_failed')}: ${result.error}`, 'error');
      }
    });
  }
}

export async function loadSettings() {
  const result = await window.api.getSettings();
  if (!result.success) {
    if (showToast) showToast(translate('msg_settings_load_error'), 'error');
    return null;
  }

  const settings = result.data;
  const currencySelect = document.getElementById('currency-select');
  const languageSelect = document.getElementById('language-select');
  const themeLightButton = document.getElementById('settings-theme-light');
  const themeDarkButton = document.getElementById('settings-theme-dark');
  const appVersion = document.getElementById('app-version');
  const transactionCount = document.getElementById('db-transaction-count');
  const dbLocation = document.getElementById('db-location');

  if (currencySelect) currencySelect.value = settings.currency;
  if (languageSelect) languageSelect.value = settings.language;
  setCurrencyPrefix(settings.currency);

  if (themeLightButton) {
    themeLightButton.classList.toggle('active', settings.theme === 'light');
    themeLightButton.setAttribute('aria-pressed', String(settings.theme === 'light'));
  }

  if (themeDarkButton) {
    themeDarkButton.classList.toggle('active', settings.theme === 'dark');
    themeDarkButton.setAttribute('aria-pressed', String(settings.theme === 'dark'));
  }

  applyTheme(settings.theme);

  if (appVersion) appVersion.textContent = 'v1.0.0';

  if (dbLocation) {
    const dbPathResult = await window.api.getDatabasePath();
    if (dbPathResult.success) {
      dbLocation.textContent = dbPathResult.data;
    } else {
      dbLocation.textContent = translate('msg_db_load_error');
    }
  }

  const statsResult = await window.api.getStatistics();
  if (statsResult.success && transactionCount) {
    transactionCount.textContent = String(statsResult.data.transactionCount);
  }

  return settings;
}

export async function updateExchangeRate(rate) {
  return await persistSettings({ usd_to_syp_rate: Number(rate) });
}
