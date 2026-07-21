'use strict';

/**
 * Validates the shared transaction form.
 *
 * @param {object} formData
 * @param {'income'|'expense'} type
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateForm(formData, type) {
  const errors = {};

  if (!formData.title || !formData.title.trim()) {
    errors.title = 'Please enter a title.';
  }

  const amount = Number(formData.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Please enter a positive amount.';
  }

  if (type === 'expense') {
    if (!formData.category || !formData.category.trim()) {
      errors.category = 'Please select a category.';
    }
  }

  if (!formData.date || Number.isNaN(new Date(formData.date).getTime())) {
    errors.date = 'Please choose a valid date.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
