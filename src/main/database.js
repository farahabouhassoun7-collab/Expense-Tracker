'use strict';

const path = require('path');
const Database = require('better-sqlite3');

// Singleton instance — only one connection is opened per process
let db = null;
let dbPath = '';

/**
 * Returns the singleton SQLite database instance.
 * On first call, creates the database file, runs schema migrations,
 * and seeds the settings row if it does not already exist.
 *
 * The database file is stored in the Electron userData directory:
 *   Windows : %APPDATA%\personal-expense-tracker\expense-tracker.db
 *   macOS   : ~/Library/Application Support/personal-expense-tracker/expense-tracker.db
 *   Linux   : ~/.config/personal-expense-tracker/expense-tracker.db
 *
 * @param {string} userDataPath - Value of app.getPath('userData') from the main process.
 *                                Must be provided on the first call.
 * @returns {Database} The open better-sqlite3 database instance.
 */
function getDb(userDataPath) {
  if (db) return db;

  if (!userDataPath) {
    throw new Error('getDb() requires userDataPath on first call');
  }

  dbPath = path.join(userDataPath, 'expense-tracker.db');

  db = new Database(dbPath);

  // Enable WAL mode for better read performance (safe for single-user desktop apps)
  db.pragma('journal_mode = WAL');

  // Enforce foreign key constraints (good practice even without explicit FKs)
  db.pragma('foreign_keys = ON');

  _initSchema(db);

  return db;
}

/**
 * Returns the path to the SQLite database file.
 *
 * @returns {string}
 */
function getDbPath() {
  return dbPath;
}

/**
 * Creates all tables and indexes if they do not already exist,
 * then seeds the settings singleton row on first init.
 *
 * @param {Database} database - The open better-sqlite3 instance.
 */
function _initSchema(database) {
  // Run the entire schema setup as a single atomic transaction
  database.transaction(() => {
    // ── income table ──────────────────────────────────────────────────────────
    database.exec(`
      CREATE TABLE IF NOT EXISTS income (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        title   TEXT    NOT NULL,
        amount  REAL    NOT NULL CHECK(amount > 0),
        date    TEXT    NOT NULL,
        note    TEXT
      );
    `);

    database.exec(`
      CREATE INDEX IF NOT EXISTS idx_income_date
        ON income(date);
    `);

    // ── expenses table ────────────────────────────────────────────────────────
    database.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        title     TEXT    NOT NULL,
        amount    REAL    NOT NULL CHECK(amount > 0),
        category  TEXT    NOT NULL,
        date      TEXT    NOT NULL,
        note      TEXT
      );
    `);

    database.exec(`
      CREATE INDEX IF NOT EXISTS idx_expenses_date
        ON expenses(date);
    `);

    database.exec(`
      CREATE INDEX IF NOT EXISTS idx_expenses_category
        ON expenses(category);
    `);

    // ── settings table (singleton, id always = 1) ─────────────────────────────
    database.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id        INTEGER PRIMARY KEY DEFAULT 1,
        currency  TEXT    NOT NULL DEFAULT 'USD',
        theme     TEXT    NOT NULL DEFAULT 'Light'
      );
    `);

    // Seed the one-and-only settings row if it does not yet exist
    database.exec(`
      INSERT OR IGNORE INTO settings (id, currency, theme)
      VALUES (1, 'USD', 'Light');
    `);
  })();
}

// ── Income CRUD ───────────────────────────────────────────────────────────────

/**
 * Inserts a new income entry and returns the full record including its
 * auto-generated id.
 *
 * @param {{ title: string, amount: number, date: string, note?: string }} data
 * @returns {{ id: number, title: string, amount: number, date: string, note: string|null }}
 */
function addIncome({ title, amount, date, note = null }) {
  const stmt = db.prepare(
    'INSERT INTO income (title, amount, date, note) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(title, amount, date, note);
  return { id: result.lastInsertRowid, title, amount, date, note };
}

/**
 * Returns all income entries ordered by date descending.
 *
 * @returns {Array<{ id: number, title: string, amount: number, date: string, note: string|null }>}
 */
function getAllIncomes() {
  return db.prepare('SELECT * FROM income ORDER BY date DESC').all();
}

/**
 * Updates an existing income entry by id.
 *
 * @param {number} id
 * @param {{ title: string, amount: number, date: string, note?: string }} data
 * @returns {{ changes: number }}
 */
function updateIncome(id, { title, amount, date, note = null }) {
  const stmt = db.prepare(
    'UPDATE income SET title = ?, amount = ?, date = ?, note = ? WHERE id = ?'
  );
  const result = stmt.run(title, amount, date, note, id);
  return { changes: result.changes };
}

/**
 * Deletes an income entry by id.
 *
 * @param {number} id
 * @returns {{ changes: number }}
 */
function deleteIncome(id) {
  const result = db.prepare('DELETE FROM income WHERE id = ?').run(id);
  return { changes: result.changes };
}

// ── Expense CRUD ──────────────────────────────────────────────────────────────

/**
 * Inserts a new expense entry and returns the full record including its
 * auto-generated id.
 *
 * @param {{ title: string, amount: number, category: string, date: string, note?: string }} data
 * @returns {{ id: number, title: string, amount: number, category: string, date: string, note: string|null }}
 */
function addExpense({ title, amount, category, date, note = null }) {
  const stmt = db.prepare(
    'INSERT INTO expenses (title, amount, category, date, note) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(title, amount, category, date, note);
  return { id: result.lastInsertRowid, title, amount, category, date, note };
}

/**
 * Returns all expense entries ordered by date descending.
 *
 * @returns {Array<{ id: number, title: string, amount: number, category: string, date: string, note: string|null }>}
 */
function getAllExpenses() {
  return db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
}

/**
 * Updates an existing expense entry by id.
 *
 * @param {number} id
 * @param {{ title: string, amount: number, category: string, date: string, note?: string }} data
 * @returns {{ changes: number }}
 */
function updateExpense(id, { title, amount, category, date, note = null }) {
  const stmt = db.prepare(
    'UPDATE expenses SET title = ?, amount = ?, category = ?, date = ?, note = ? WHERE id = ?'
  );
  const result = stmt.run(title, amount, category, date, note, id);
  return { changes: result.changes };
}

/**
 * Deletes an expense entry by id.
 *
 * @param {number} id
 * @returns {{ changes: number }}
 */
function deleteExpense(id) {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return { changes: result.changes };
}

// ── Settings Operations ───────────────────────────────────────────────────────

/**
 * Returns the single settings row (id = 1).
 *
 * @returns {{ currency: string, theme: string }}
 */
function getSettings() {
  return db.prepare('SELECT currency, theme FROM settings WHERE id = 1').get();
}

/**
 * Updates the single settings row (id = 1).
 * Only the fields provided are updated; both must be supplied together.
 *
 * @param {{ currency: string, theme: string }} data
 * @returns {{ changes: number }}
 */
function updateSettings({ currency, theme }) {
  const stmt = db.prepare(
    'UPDATE settings SET currency = ?, theme = ? WHERE id = 1'
  );
  const result = stmt.run(currency, theme);
  return { changes: result.changes };
}

// ── Statistics Aggregate ──────────────────────────────────────────────────────

/**
 * Returns an aggregate statistics object used by the Dashboard and
 * Statistics pages.
 *
 * @returns {{
 *   totalIncome: number,
 *   totalExpenses: number,
 *   balance: number,
 *   transactionCount: number,
 *   expensesByCategory: Array<{ category: string, total: number }>,
 *   expensesByMonth: Array<{ month: string, total: number }>
 * }}
 */
function getStatistics() {
  // Total income (NULL-safe: returns 0 when no rows exist)
  const totalIncome = db
    .prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM income')
    .get().total;

  // Total expenses
  const totalExpenses = db
    .prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses')
    .get().total;

  // Total transaction count across both tables
  const transactionCount = db
    .prepare(
      'SELECT (SELECT COUNT(*) FROM income) + (SELECT COUNT(*) FROM expenses) AS cnt'
    )
    .get().cnt;

  // Expenses grouped by category, descending by total spend
  const expensesByCategory = db
    .prepare(
      'SELECT category, COALESCE(SUM(amount), 0) AS total ' +
      'FROM expenses GROUP BY category ORDER BY total DESC'
    )
    .all();

  // Expenses grouped by month (YYYY-MM), ascending chronological order
  const expensesByMonth = db
    .prepare(
      "SELECT strftime('%Y-%m', date) AS month, COALESCE(SUM(amount), 0) AS total " +
      'FROM expenses GROUP BY month ORDER BY month ASC'
    )
    .all();

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount,
    expensesByCategory,
    expensesByMonth,
  };
}

// ── Recent Transactions ───────────────────────────────────────────────────────

/**
 * Returns the 10 most recent transactions across income and expenses,
 * ordered by date descending.
 *
 * Each row is tagged with a `type` column: 'income' or 'expense'.
 * Income rows have `category` set to null.
 *
 * @returns {Array<{
 *   type: 'income'|'expense',
 *   id: number,
 *   title: string,
 *   amount: number,
 *   category: string|null,
 *   date: string,
 *   note: string|null
 * }>}
 */
function getRecentTransactions() {
  return db
    .prepare(
      "SELECT 'income'  AS type, id, title, amount, NULL AS category, date, note FROM income " +
      'UNION ALL ' +
      "SELECT 'expense' AS type, id, title, amount, category,          date, note FROM expenses " +
      'ORDER BY date DESC ' +
      'LIMIT 10'
    )
    .all();
}

module.exports = {
  getDb,
  getDbPath,
  addIncome, getAllIncomes, updateIncome, deleteIncome,
  addExpense, getAllExpenses, updateExpense, deleteExpense,
  getSettings, updateSettings,
  getStatistics,
  getRecentTransactions,
};
