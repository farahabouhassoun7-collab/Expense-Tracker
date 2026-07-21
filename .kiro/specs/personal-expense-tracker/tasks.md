# Implementation Plan: Personal Expense Tracker

## Overview

This task list implements the Personal Expense Tracker desktop application based on the approved requirements and technical design documents. Tasks are organized into 6 sequential phases, each independently buildable and testable. The stack is Electron.js, Node.js, Vanilla JavaScript, SQLite (better-sqlite3), and Chart.js.

## Tasks

### Phase 1: Project Setup

- [x] 1. Initialize Electron project with package.json
  - Run npm init and install Electron as a pinned dev dependency. Set `"main": "main.js"` and add `start` script pointing to Electron.
  - Files: `package.json`
  - Acceptance: `npm start` launches Electron without errors; Electron version is pinned exactly.

- [x] 2. Create folder structure
  - Create all project directories: `src/main/`, `src/renderer/pages/`, `src/renderer/js/`, `src/renderer/css/`, `src/renderer/assets/icons/`. Add `.gitignore` excluding `node_modules/` and `dist/`.
  - Files: `.gitignore`, directory structure
  - Acceptance: All directories exist as specified in the design document; `.gitignore` excludes node_modules and dist.

- [x] 3. Install runtime and dev dependencies
  - Install `better-sqlite3` as a runtime dependency and `electron-builder` as a dev dependency, both with pinned versions.
  - Files: `package.json`, `package-lock.json`
  - Acceptance: `npm install` completes without errors; `node_modules/better-sqlite3` exists.

- [x] 4. Add Chart.js as a local asset
  - Download the Chart.js UMD bundle (`chart.umd.min.js`) and place it in `src/renderer/assets/` so the app works offline.
  - Files: `src/renderer/assets/chart.umd.min.js`
  - Acceptance: File exists and loads correctly when referenced from an HTML `<script>` tag.


### Phase 2: Database

- [x] 5. Create database module with schema initialization
  - Create `src/main/database.js`. On call, open (or create) the SQLite file at `app.getPath('userData')/expense-tracker.db` using `better-sqlite3`. Run `CREATE TABLE IF NOT EXISTS` for all three tables with CHECK constraints and indexes. Seed the settings row on first init.
  - Files: `src/main/database.js`
  - Acceptance: All three tables created on first run; settings row seeded with `currency='USD'` and `theme='Light'`; `CHECK(amount > 0)` constraint exists; calling `getDb()` twice returns the same instance.

- [x] 6. Implement income CRUD operations
  - Add `addIncome`, `getAllIncomes`, `updateIncome`, `deleteIncome` to `src/main/database.js` using `better-sqlite3` prepared statements. All queries are parameterized.
  - Files: `src/main/database.js`
  - Acceptance: `addIncome` returns the new record with auto-generated id; `getAllIncomes` returns rows ordered by date DESC; `updateIncome` and `deleteIncome` return `{ changes: 1 }` on success; inserting with `amount <= 0` throws.

- [x] 7. Implement expense CRUD operations
  - Add `addExpense`, `getAllExpenses`, `updateExpense`, `deleteExpense` to `src/main/database.js`, mirroring the income pattern but including the `category` field.
  - Files: `src/main/database.js`
  - Acceptance: `addExpense` returns the new record with id; `getAllExpenses` returns rows ordered by date DESC; update and delete return `{ changes: 1 }`; inserting with `amount <= 0` throws.

- [x] 8. Implement settings operations
  - Add `getSettings()` and `updateSettings({ currency, theme })` to the database module. Settings row always has `id = 1`; updates use `UPDATE ... WHERE id = 1`.
  - Files: `src/main/database.js`
  - Acceptance: `getSettings()` returns `{ currency: 'USD', theme: 'Light' }` on fresh DB; calling `updateSettings` then `getSettings` returns updated values; settings table always contains exactly one row.

- [x] 9. Implement statistics aggregate query
  - Add `getStatistics()` to the database module returning `{ totalIncome, totalExpenses, balance, transactionCount, expensesByCategory, expensesByMonth }` from aggregate SQL queries.
  - Files: `src/main/database.js`
  - Acceptance: All fields calculated correctly; `balance = totalIncome - totalExpenses`; `expensesByCategory` is an array of `{ category, total }`; `expensesByMonth` is an array of `{ month, total }` in YYYY-MM format; returns zeros and empty arrays on empty DB.

- [x] 10. Implement recent transactions query
  - Add `getRecentTransactions()` to the database module using a SQL UNION of income and expenses tagged with a `type` column, ordered by date DESC, limited to 10 rows.
  - Files: `src/main/database.js`
  - Acceptance: Returns at most 10 rows; each row includes `type`, `id`, `title`, `amount`, `category` (null for income), `date`, `note`; ordered by date DESC; returns empty array on empty DB.


### Phase 3: Electron Core

- [x] 11. Configure main process entry point
  - Create `main.js` at the project root. Create a `BrowserWindow` with `contextIsolation: true`, `nodeIntegration: false`, `preload` pointing to `preload.js`, minimum size 1000×700. On `app.ready`, call `getDb()` then load `src/renderer/pages/index.html`.
  - Files: `main.js`
  - Acceptance: `npm start` opens a desktop window; `contextIsolation: true` and `nodeIntegration: false` are set; DB file created in `app.getPath('userData')`; app quits cleanly on all platforms.

- [x] 12. Create preload script with context bridge
  - Create `preload.js`. Use `contextBridge.exposeInMainWorld('api', {...})` to expose all IPC invoke calls: `addIncome`, `getIncomes`, `updateIncome`, `deleteIncome`, `addExpense`, `getExpenses`, `updateExpense`, `deleteExpense`, `getStatistics`, `getRecentTransactions`, `getSettings`, `updateSettings`, `exportToCSV`.
  - Files: `preload.js`
  - Acceptance: `window.api` is available in the renderer with all listed methods; each method calls `ipcRenderer.invoke` with the correct channel; no Node.js APIs are directly exposed.

- [x] 13. Register IPC handlers in main process
  - Create `src/main/ipc-handlers.js` exporting `registerHandlers(ipcMain)`. Register `ipcMain.handle` for all 12 IPC channels, each wrapping its database call in try/catch and returning `{ success: true, data }` or `{ success: false, error }`. Call `registerHandlers` from `main.js`.
  - Files: `src/main/ipc-handlers.js`, `main.js`
  - Acceptance: All 12 channels are registered; every handler returns the consistent response envelope; calling `window.api.getSettings()` from renderer returns the settings object.

- [x] 14. Create file manager module for CSV export
  - Create `src/main/file-manager.js` exporting `exportToCSV(db)`. It queries all income and expenses, builds a CSV string with header `type,title,amount,category,date,note`, opens a native `dialog.showSaveDialog`, writes the file with `fs.writeFile`, and returns a result object. Register the `export:csv` IPC handler.
  - Files: `src/main/file-manager.js`, `src/main/ipc-handlers.js`
  - Acceptance: Export opens the OS native save dialog; CSV contains header row plus one row per transaction; cancelling returns `{ success: false, cancelled: true }` without writing a file; write failure returns `{ success: false, error }`.


### Phase 4: User Interface

- [x] 15. Create global CSS styles and theme variables
  - Create `src/renderer/css/main.css` with CSS reset, base typography, layout utilities. Create `src/renderer/css/themes.css` with full CSS custom properties for light mode in `:root` and dark mode in `[data-theme="dark"]`.
  - Files: `src/renderer/css/main.css`, `src/renderer/css/themes.css`
  - Acceptance: Adding `data-theme="dark"` to `<html>` visually switches the color scheme; all color variables defined for both themes; layout is responsive to window resizing.

- [x] 16. Create component styles
  - Create `src/renderer/css/components.css` with styles for summary cards, primary/secondary/danger buttons, form inputs, data tables, modal overlay, and toast notifications. Create `src/renderer/css/charts.css` with chart container sizing.
  - Files: `src/renderer/css/components.css`, `src/renderer/css/charts.css`
  - Acceptance: Cards, buttons, inputs, and modal are visually styled; all components respect current theme CSS variables; focus states are visible on form inputs.

- [x] 17. Build application shell with navigation and layout
  - Create `src/renderer/pages/index.html` as the single-page shell. Include a `<nav>` sidebar with links to Dashboard, Transactions, Statistics, and Settings; a `<div id="content">` for page sections; floating action buttons for Add Income and Add Expense; and a hidden shared modal skeleton. Link all CSS files and load `renderer.js`.
  - Files: `src/renderer/pages/index.html`, `src/renderer/js/renderer.js` (empty skeleton)
  - Acceptance: Window shows sidebar with four nav links; content area is visible alongside sidebar; modal is in DOM but hidden; floating action buttons are visible; page renders without console errors.

- [x] 18. Build Dashboard section HTML
  - Add `<section id="dashboard">` to `index.html` with four summary cards (Balance, Total Income, Total Expenses, Transaction Count), a doughnut chart canvas `#dashboardChart`, and a recent transactions container `#recentTransactions`.
  - Files: `src/renderer/pages/index.html`
  - Acceptance: Four summary cards show placeholder values; chart canvas element is present with defined dimensions; recent transactions container is present and empty; Dashboard section is visible on initial load.

- [x] 19. Build Transactions section HTML
  - Add `<section id="transactions">` to `index.html` with a search input, a category `<select>` filter (All + 7 categories), date-range inputs, an Export CSV button, and a `<table>` with columns: Date, Type, Title, Category, Amount, Actions.
  - Files: `src/renderer/pages/index.html`
  - Acceptance: Section hidden by default; all filter controls present and styled; category dropdown has all 7 default categories; table has correct column headers; Export button present.

- [x] 20. Build Statistics section HTML
  - Add `<section id="statistics">` to `index.html` with three summary cards (Total Income, Total Expenses, Balance), a pie chart canvas `#categoryPieChart`, a bar chart canvas `#monthlyBarChart`, and empty-state message elements for each chart.
  - Files: `src/renderer/pages/index.html`
  - Acceptance: Section hidden by default; both canvas elements present with defined container sizes; empty-state message elements exist (hidden by default).

- [x] 21. Build Settings section HTML
  - Add `<section id="settings">` to `index.html` with a currency `<select>` (USD, EUR, GBP, JPY, INR), a theme toggle (Light/Dark radio buttons or toggle), and an Export CSV button.
  - Files: `src/renderer/pages/index.html`
  - Acceptance: Section hidden by default; currency dropdown lists all 5 options; theme toggle has exactly two states; all controls have visible labels; Export button present.

- [x] 22. Complete Add/Edit modal markup
  - Finish the shared modal `<div id="modal">` in `index.html` with a dynamic title, fields for Title, Amount, Category (conditionally shown), Date, Note, inline error `<span>` per field, a hidden `data-id` input, Cancel and Save buttons.
  - Files: `src/renderer/pages/index.html`
  - Acceptance: All required fields present; each field has an associated error span; Category field can be shown/hidden via JS; Save and Cancel buttons present; tab order is logical.


### Phase 5: Features

- [x] 23. Implement page navigation logic
  - In `renderer.js`, implement `showPage(pageId)` that hides all sections, removes the `active` class from all nav links, then shows the target section and marks its link active. Attach click listeners to all nav links. Show Dashboard on startup.
  - Files: `src/renderer/js/renderer.js`
  - Acceptance: Clicking each nav link shows only its section; active nav link has distinct visual style; Dashboard is shown on initial load; no console errors.

- [ ] 24. Implement client-side form validator
  - Create `src/renderer/js/form-validator.js` exporting `validateForm(formData, type)`. Validate: title non-empty after trim; amount is numeric and > 0; category non-empty for expenses; date is valid. Return `{ valid: true }` or `{ valid: false, errors: { field: message } }`.
  - Files: `src/renderer/js/form-validator.js`
  - Acceptance: Empty title returns title error; amount of 0 or -5 returns amount error; valid income data returns `{ valid: true }`; missing category on expense returns category error; whitespace-only title is treated as empty.

- [x] 25. Implement modal open/close logic
  - In `renderer.js`, implement `openModal(type, data)` — hide category for income, show for expense, pre-populate fields in edit mode. Implement `closeModal()` to clear form, hide all error spans, and hide the modal. Wire Cancel button, × button, and backdrop click.
  - Files: `src/renderer/js/renderer.js`
  - Acceptance: Add Income opens modal with title "Add Income" and no category field; Add Expense shows category field; Edit mode pre-fills all fields; Cancel/× closes and clears the modal; backdrop click closes modal.

- [ ] 26. Implement Add Income feature
  - In `renderer.js`, handle the Save button click in income mode: collect form values, run `validateForm`, show inline errors on failure, or call `window.api.addIncome(data)` on success. On success, close the modal and refresh the active page.
  - Files: `src/renderer/js/renderer.js`
  - Acceptance: Valid income form creates a record and closes the modal; empty title shows inline error; amount 0 shows inline error; Dashboard balance updates after add; DB error shows a toast notification.

- [ ] 27. Implement Edit Income feature
  - Wire the edit button on income rows to call `openModal('income', record)`. In `renderer.js`, handle Save in edit mode by calling `window.api.updateIncome(id, data)`. On success, refresh the transactions list.
  - Files: `src/renderer/js/renderer.js`, `src/renderer/js/transactions.js` (create skeleton)
  - Acceptance: Clicking edit on an income row opens the modal pre-filled with that record's data; saving a valid edit updates the record; validation errors shown inline; cancelling leaves the original record unchanged.

- [ ] 28. Implement Delete Income feature
  - In `transactions.js`, wire the delete button on income rows to show a `confirm()` dialog. On confirmation, call `window.api.deleteIncome(id)`, remove the row from the UI, and refresh summary cards.
  - Files: `src/renderer/js/transactions.js`
  - Acceptance: Clicking delete shows a confirmation dialog; confirming removes the row and updates the DB; cancelling leaves the record intact; Dashboard totals update after deletion.

- [ ] 29. Implement Add Expense feature
  - In `renderer.js`, handle the Save button click in expense mode: collect form values including category, run `validateForm` (expense type), call `window.api.addExpense(data)` on success, close modal, and refresh the active page.
  - Files: `src/renderer/js/renderer.js`
  - Acceptance: Valid expense form creates a record with category; missing category shows inline error; Dashboard expense total updates after add; new expense appears in Transactions list.

- [ ] 30. Implement Edit and Delete Expense features
  - Wire the edit button on expense rows to open the modal pre-filled (including category). Wire the delete button with confirmation. Call `window.api.updateExpense` and `window.api.deleteExpense` respectively.
  - Files: `src/renderer/js/transactions.js`
  - Acceptance: Edit opens modal with correct category selected; saving updates the record; delete removes after confirmation; all summary cards reflect changes.

- [ ] 31. Implement Dashboard data loading
  - Create `src/renderer/js/dashboard.js`. On Dashboard activation, call `window.api.getStatistics()` and `window.api.getRecentTransactions()`. Populate the four summary cards with formatted currency values and render the recent transactions list.
  - Files: `src/renderer/js/dashboard.js`, `src/renderer/js/renderer.js`
  - Acceptance: Cards show correct totals; recent list shows up to 10 entries ordered by date DESC; income entries tagged green, expense entries tagged red; empty DB shows $0.00 and count 0; values formatted with current currency symbol.

- [ ] 32. Implement Transactions list loading
  - In `transactions.js`, implement `loadTransactions()`: call `window.api.getIncomes()` and `window.api.getExpenses()`, merge and sort by date DESC, render each row with edit and delete action buttons.
  - Files: `src/renderer/js/transactions.js`, `src/renderer/js/renderer.js`
  - Acceptance: All income and expense records displayed; rows sorted by date DESC; each row shows Date, Type badge, Title, Category (blank for income), Amount, and action icons; empty state shows "No transactions yet."

- [ ] 33. Implement search and filter on Transactions page
  - In `transactions.js`, attach `input` and `change` listeners to the search box, category dropdown, and date inputs. Implement `applyFilters()` that filters the in-memory array by title (case-insensitive), category (expenses only), and date range (inclusive). Re-render after each change.
  - Files: `src/renderer/js/transactions.js`
  - Acceptance: Search filters rows in real time; category filter hides income rows and shows only matching expenses; date range filter works inclusively; all three filters combine simultaneously; clearing filters restores full list; "No results" message when filters return zero rows.

- [ ] 34. Implement Statistics page with Chart.js charts
  - Create `src/renderer/js/statistics.js`. On Statistics activation, call `window.api.getStatistics()`, populate three summary cards, render a pie chart on `#categoryPieChart` using `expensesByCategory`, and a bar chart on `#monthlyBarChart` using `expensesByMonth`. Show empty-state messages when no expense data exists.
  - Files: `src/renderer/js/statistics.js`, `src/renderer/js/renderer.js`
  - Acceptance: Summary cards show correct totals; pie chart renders with one slice per category; bar chart renders with one bar per month; correct data labels and values; empty state shown when no expenses; charts destroyed and re-created on each visit to avoid canvas reuse errors.

- [ ] 35. Implement theme switching
  - Create `src/renderer/js/theme.js` with `applyTheme(theme)` setting/removing `data-theme="dark"` on `<html>`. Create `src/renderer/js/settings.js` loading settings on activation and wiring the theme toggle to call `window.api.updateSettings` then `applyTheme`. Call `initTheme()` on app startup.
  - Files: `src/renderer/js/theme.js`, `src/renderer/js/settings.js`, `src/renderer/js/renderer.js`
  - Acceptance: Toggling Dark applies dark colors to all UI elements immediately; toggling Light restores light colors; selected theme persists after app restart; Chart.js charts re-render with updated colors after theme change; Settings page shows current theme on load.

- [ ] 36. Implement currency setting
  - In `settings.js`, wire the currency dropdown change event to call `window.api.updateSettings({ currency })`. Create a shared `formatCurrency(amount, currency)` helper and use it in all pages for monetary display. Re-render active page after currency change.
  - Files: `src/renderer/js/settings.js`, `src/renderer/js/renderer.js`
  - Acceptance: Changing currency updates all visible monetary values immediately; reopening app shows saved currency applied everywhere; `formatCurrency(1234.5, 'EUR')` returns string with `€` and `1234.50`; currency dropdown shows saved value on Settings load.

- [ ] 37. Implement CSV export trigger
  - In `settings.js` and `transactions.js`, attach click handlers to Export buttons that call `window.api.exportToCSV()`. Handle three result states: success → green toast; cancelled → no notification; error → red toast with error message.
  - Files: `src/renderer/js/settings.js`, `src/renderer/js/transactions.js`
  - Acceptance: Clicking Export opens the OS native save dialog; success shows green toast "Export successful"; cancelling shows no notification; write error shows red toast with reason; exported CSV has header row and correct data for all transactions.

- [x] 38. Implement toast notification system
  - Add `<div id="toast">` to `index.html`. In `renderer.js`, implement `showToast(message, type)` where `type` is `'success'` or `'error'`. Toast appears for 3 seconds then fades out. Use it for export results and DB write errors.
  - Files: `src/renderer/pages/index.html`, `src/renderer/js/renderer.js`, `src/renderer/css/components.css`
  - Acceptance: Success toast is green, error toast is red; auto-dismisses after 3 seconds; new toast replaces any existing toast; toast is visible above all other content.


### Phase 6: Testing and Packaging

- [ ] 39. End-to-end smoke testing
  - Manually run through a structured smoke test checklist covering: all CRUD operations, search and filter combinations (including combined filters), theme switching with persistence, currency change, CSV export, app restart data persistence, and empty-state messages.
  - Files: No code changes — manual testing task
  - Acceptance: All items in the smoke test checklist pass; any bugs found are documented with reproduction steps.

- [ ] 40. Fix identified bugs
  - Resolve all bugs found during smoke testing. Prioritise: P0 data loss/crash bugs first, then P1 functional bugs, then visual issues. Re-test each affected feature after fixing.
  - Files: Any files identified during testing
  - Acceptance: All P0 and P1 bugs resolved; smoke test checklist passes with zero failures.

- [ ] 41. Configure electron-builder for Windows packaging
  - Add a `"build"` configuration block to `package.json` with `appId`, `productName: "Personal Expense Tracker"`, `win.target: "nsis"`, `win.icon`, and `output: "dist/"`. Add a `package` script: `electron-builder --win`. Add a basic `icon.ico` app icon.
  - Files: `package.json`, `src/renderer/assets/icons/icon.ico`
  - Acceptance: `npm run package` completes without errors; a `.exe` installer is generated in `dist/`; installing and running on Windows launches the application with the correct product name.

- [ ] 42. Final cleanup and optimization
  - Remove all `console.log` debug statements from renderer and main process files. Verify no large or unintended files are included in the build. Confirm the final build opens and loads Dashboard within 3 seconds.
  - Files: Any files containing debug output
  - Acceptance: No `console.log` statements remain in production code; app launches and loads Dashboard within 3 seconds; all Requirement 1 acceptance criteria pass on the final build.

## Notes

- All database operations use parameterized prepared statements (no string interpolation) per the security requirements.
- The settings table always contains exactly one row with `id = 1`; never insert a second row.
- Chart.js instances must be destroyed before re-creating on the Statistics page to avoid the "Canvas is already in use" error.
- The `better-sqlite3` synchronous API is intentional — it simplifies error handling for this single-user desktop app.
- CSS theme switching is done exclusively via the `data-theme="dark"` attribute on `<html>` — no JavaScript is needed to update individual elements.
- All monetary amounts are formatted to 2 decimal places using the active currency symbol from settings.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1] },
    { "wave": 2, "tasks": [2] },
    { "wave": 3, "tasks": [3, 4] },
    { "wave": 4, "tasks": [5] },
    { "wave": 5, "tasks": [6, 7, 8] },
    { "wave": 6, "tasks": [9, 10] },
    { "wave": 7, "tasks": [11] },
    { "wave": 8, "tasks": [12] },
    { "wave": 9, "tasks": [13] },
    { "wave": 10, "tasks": [14] },
    { "wave": 11, "tasks": [15] },
    { "wave": 12, "tasks": [16] },
    { "wave": 13, "tasks": [17] },
    { "wave": 14, "tasks": [18, 19, 20, 21, 22] },
    { "wave": 15, "tasks": [23, 24] },
    { "wave": 16, "tasks": [25] },
    { "wave": 17, "tasks": [26, 29] },
    { "wave": 18, "tasks": [27, 30, 31, 32, 38] },
    { "wave": 19, "tasks": [28, 33, 34, 35, 36, 37] },
    { "wave": 20, "tasks": [39] },
    { "wave": 21, "tasks": [40] },
    { "wave": 22, "tasks": [41] },
    { "wave": 23, "tasks": [42] }
  ]
}
```
