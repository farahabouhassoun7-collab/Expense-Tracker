'use strict';

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
};

/**
 * Applies the selected theme by toggling data-theme on <html>.
 * Also updates the sidebar and settings theme buttons.
 *
 * @param {'light'|'dark'} theme
 */
export function applyTheme(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';

  if (normalizedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  const lightButtons = document.querySelectorAll('#theme-light, #settings-theme-light');
  const darkButtons = document.querySelectorAll('#theme-dark, #settings-theme-dark');

  lightButtons.forEach((btn) => {
    const isActive = normalizedTheme === 'light';
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  darkButtons.forEach((btn) => {
    const isActive = normalizedTheme === 'dark';
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

/**
 * Formats a number as currency using the selected currency code.
 *
 * @param {number|string} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD') {
  const numeric = Number(amount) || 0;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch (err) {
    return `${currency} ${numeric.toFixed(2)}`;
  }
}

/**
 * Returns the symbol used for the selected currency.
 *
 * @param {string} currency
 * @returns {string}
 */
export function getCurrencySymbol(currency = 'USD') {
  return currencySymbols[currency] || currency;
}
