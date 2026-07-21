'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposes a secure, minimal API to the renderer process via contextBridge.
 *
 * Security guarantees:
 *   - contextIsolation: true  — renderer JS cannot access this script's scope
 *   - nodeIntegration: false  — renderer cannot require() Node modules
 *   - Only named, explicit IPC channels are exposed (no generic invoke/send)
 *
 * All methods return Promises that resolve with the main-process response.
 * The main process always returns { success: true, data } or { success: false, error }.
 */
contextBridge.exposeInMainWorld('api', {

  // ── Income ─────────────────────────────────────────────────────────────────
  /** @param {{ title: string, amount: number, date: string, note?: string }} data */
  addIncome: (data) => ipcRenderer.invoke('income:add', data),

  /** @returns {Promise<Array>} */
  getIncomes: () => ipcRenderer.invoke('income:get'),

  /** @param {number} id @param {object} data */
  updateIncome: (id, data) => ipcRenderer.invoke('income:update', { id, ...data }),

  /** @param {number} id */
  deleteIncome: (id) => ipcRenderer.invoke('income:delete', { id }),

  // ── Expenses ───────────────────────────────────────────────────────────────
  /** @param {{ title: string, amount: number, category: string, date: string, note?: string }} data */
  addExpense: (data) => ipcRenderer.invoke('expense:add', data),

  /** @returns {Promise<Array>} */
  getExpenses: () => ipcRenderer.invoke('expense:get'),

  /** @param {number} id @param {object} data */
  updateExpense: (id, data) => ipcRenderer.invoke('expense:update', { id, ...data }),

  /** @param {number} id */
  deleteExpense: (id) => ipcRenderer.invoke('expense:delete', { id }),

  // ── Statistics & Recent Transactions ───────────────────────────────────────
  /** @returns {Promise<object>} Aggregate stats object */
  getStatistics: () => ipcRenderer.invoke('stats:get'),

  /** @returns {Promise<Array>} Up to 10 most recent transactions */
  getRecentTransactions: () => ipcRenderer.invoke('transactions:recent'),

  // ── Settings ───────────────────────────────────────────────────────────────
  /** @returns {Promise<{ currency: string, theme: string }>} */
  getSettings: () => ipcRenderer.invoke('settings:get'),

  /** @param {{ currency: string, theme: string }} data */
  updateSettings: (data) => ipcRenderer.invoke('settings:update', data),

  /** @returns {Promise<string>} */
  getDatabasePath: () => ipcRenderer.invoke('db:path'),

  // ── Export ─────────────────────────────────────────────────────────────────
  /** Triggers the native save dialog and writes a CSV file */
  exportToCSV: () => ipcRenderer.invoke('export:csv'),
});
