'use strict';

const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');
const { getAllIncomes, getAllExpenses } = require('./database');

/**
 * Escapes a single CSV field value.
 *
 * Rules (RFC 4180):
 *   - If the value contains a comma, double-quote, or newline it is wrapped
 *     in double-quotes.
 *   - Any existing double-quote characters inside the value are doubled ("").
 *   - null / undefined are serialised as an empty string.
 *
 * @param {any} value
 * @returns {string}
 */
function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Wrap in quotes if the field contains special characters
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Builds a CSV string from the given array of row objects.
 *
 * Output format:
 *   type,title,amount,category,date,note
 *   income,Salary,3000.00,,2024-01-15,Monthly salary
 *   expense,Groceries,85.50,Food,2024-01-16,Weekly shop
 *
 * Income rows always have an empty category column.
 * Amount values are serialised to exactly 2 decimal places.
 *
 * @param {Array<object>} incomes  - Rows from the income table
 * @param {Array<object>} expenses - Rows from the expenses table
 * @returns {string} Complete CSV content including the header row and CRLF
 *                   line endings (RFC 4180 compliant).
 */
function buildCsvString(incomes, expenses) {
  const CRLF = '\r\n';
  const header = 'type,title,amount,category,date,note';

  const incomeRows = incomes.map(row =>
    [
      'income',
      escapeCsvField(row.title),
      escapeCsvField(Number(row.amount).toFixed(2)),
      '',                               // category is always empty for income
      escapeCsvField(row.date),
      escapeCsvField(row.note),
    ].join(',')
  );

  const expenseRows = expenses.map(row =>
    [
      'expense',
      escapeCsvField(row.title),
      escapeCsvField(Number(row.amount).toFixed(2)),
      escapeCsvField(row.category),
      escapeCsvField(row.date),
      escapeCsvField(row.note),
    ].join(',')
  );

  // Merge and sort all data rows by date descending so the CSV reflects the
  // same ordering the user sees in the Transactions list.
  const allRows = [...incomeRows, ...expenseRows];

  // Re-sort: extract the date segment from each data row for comparison.
  // Both income and expense rows have date at column index 4 (0-based).
  const dataWithDate = allRows.map((csvRow, i) => {
    const isIncome = i < incomes.length;
    const source   = isIncome ? incomes[i] : expenses[i - incomes.length];
    return { csvRow, date: source.date };
  });
  dataWithDate.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const sortedRows = dataWithDate.map(r => r.csvRow);

  return [header, ...sortedRows].join(CRLF) + CRLF;
}

/**
 * Handles the full CSV export flow:
 *   1. Queries all income and expense records from the database.
 *   2. Builds a CSV string.
 *   3. Opens the native OS "Save File" dialog.
 *   4. Writes the file to the user-selected path.
 *
 * Return values:
 *   { success: true }                      — file written successfully
 *   { success: false, cancelled: true }    — user dismissed the dialog
 *   { success: false, error: string }      — write or query failure
 *
 * @param {Electron.BrowserWindow} parentWindow - Used to make the dialog modal.
 * @returns {Promise<{ success: boolean, cancelled?: boolean, error?: string }>}
 */
async function exportToCSV(parentWindow) {
  // ── 1. Query all transactions ─────────────────────────────────────────────
  let incomes;
  let expenses;

  try {
    incomes  = getAllIncomes();
    expenses = getAllExpenses();
  } catch (err) {
    return { success: false, error: `Failed to read transactions: ${err.message}` };
  }

  // ── 2. Build CSV string ───────────────────────────────────────────────────
  const csvContent = buildCsvString(incomes, expenses);

  // ── 3. Open native Save dialog ────────────────────────────────────────────
  const defaultFilename = `expense-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`;

  let saveResult;
  try {
    saveResult = await dialog.showSaveDialog(parentWindow, {
      title: 'Export Transactions to CSV',
      defaultPath: defaultFilename,
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
  } catch (err) {
    return { success: false, error: `Failed to open save dialog: ${err.message}` };
  }

  // User cancelled the dialog
  if (saveResult.canceled || !saveResult.filePath) {
    return { success: false, cancelled: true };
  }

  // ── 4. Write the file ─────────────────────────────────────────────────────
  try {
    fs.writeFileSync(saveResult.filePath, csvContent, { encoding: 'utf8' });
  } catch (err) {
    return { success: false, error: `Failed to write file: ${err.message}` };
  }

  return { success: true };
}

module.exports = { exportToCSV, buildCsvString };
