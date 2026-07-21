'use strict';

const {
  getDbPath,
  addIncome, getAllIncomes, updateIncome, deleteIncome,
  addExpense, getAllExpenses, updateExpense, deleteExpense,
  getSettings, updateSettings,
  getStatistics,
  getRecentTransactions,
} = require('./database');

const { exportToCSV } = require('./file-manager');

/**
 * Wraps a database call in a consistent response envelope.
 * Every IPC handler returns either:
 *   { success: true,  data: <result> }
 *   { success: false, error: '<message>' }
 *
 * @param {Function} fn - Async or sync function to execute
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
async function safeCall(fn) {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}

/**
 * Registers all IPC handlers on the provided ipcMain instance.
 * Call this once from main.js after the app is ready.
 *
 * Channels registered (13 total):
 *   income:add, income:get, income:update, income:delete
 *   expense:add, expense:get, expense:update, expense:delete
 *   stats:get, transactions:recent
 *   settings:get, settings:update
 *   export:csv
 *
 * @param {Electron.IpcMain} ipcMain
 * @param {Electron.BrowserWindow} mainWindow - Passed to exportToCSV so the
 *   save dialog is shown as a modal child of the main window.
 */
function registerHandlers(ipcMain, mainWindow) {

  // ── Income ─────────────────────────────────────────────────────────────────

  ipcMain.handle('income:add', (_event, data) =>
    safeCall(() => addIncome(data))
  );

  ipcMain.handle('income:get', () =>
    safeCall(() => getAllIncomes())
  );

  ipcMain.handle('income:update', (_event, { id, ...data }) =>
    safeCall(() => updateIncome(id, data))
  );

  ipcMain.handle('income:delete', (_event, { id }) =>
    safeCall(() => deleteIncome(id))
  );

  // ── Expenses ───────────────────────────────────────────────────────────────

  ipcMain.handle('expense:add', (_event, data) =>
    safeCall(() => addExpense(data))
  );

  ipcMain.handle('expense:get', () =>
    safeCall(() => getAllExpenses())
  );

  ipcMain.handle('expense:update', (_event, { id, ...data }) =>
    safeCall(() => updateExpense(id, data))
  );

  ipcMain.handle('expense:delete', (_event, { id }) =>
    safeCall(() => deleteExpense(id))
  );

  // ── Statistics & Recent Transactions ───────────────────────────────────────

  ipcMain.handle('stats:get', () =>
    safeCall(() => getStatistics())
  );

  ipcMain.handle('transactions:recent', () =>
    safeCall(() => getRecentTransactions())
  );

  // ── Settings ───────────────────────────────────────────────────────────────

  ipcMain.handle('settings:get', () =>
    safeCall(() => getSettings())
  );

  ipcMain.handle('settings:update', (_event, data) =>
    safeCall(() => updateSettings(data))
  );

  ipcMain.handle('db:path', () =>
    safeCall(() => getDbPath())
  );

  // ── CSV Export ─────────────────────────────────────────────────────────────

  ipcMain.handle('export:csv', () =>
    // exportToCSV handles its own try/catch and always returns the response
    // envelope — no safeCall wrapper needed here.
    exportToCSV(mainWindow)
  );
}

module.exports = { registerHandlers };
