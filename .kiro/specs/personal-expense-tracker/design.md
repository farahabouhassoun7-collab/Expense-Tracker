# Technical Design Document

## Overview

The Personal Expense Tracker is an offline-first desktop application built with Electron.js that enables users to manage their personal finances locally. The application provides comprehensive income and expense tracking, statistical visualization, data export capabilities, and customization options—all without requiring internet connectivity or user authentication.

### Core Technologies

- **Electron.js**: Cross-platform desktop application framework
- **Node.js**: Backend runtime for main process operations
- **SQLite**: Local relational database for persistent storage
- **Chart.js**: Statistical visualization library
- **Vanilla JavaScript**: Frontend logic without framework dependencies
- **HTML/CSS**: User interface structure and styling

### Design Principles

1. **Offline-First**: All functionality operates without internet connectivity
2. **Simplicity**: Clean, straightforward architecture suitable for personal use
3. **Data Integrity**: Immediate persistence with validation
4. **Cross-Platform**: Consistent functionality across Windows, macOS, and Linux
5. **Responsive**: Adaptive UI that handles window resizing gracefully

---

## Architecture

### Overall System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Application                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Renderer Process (UI)                  │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │    │
│  │  │Dashboard │  │Trans List│  │ Statistics   │     │    │
│  │  │   Page   │  │   Page   │  │    Page      │     │    │
│  │  └──────────┘  └──────────┘  └──────────────┘     │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐                        │    │
│  │  │Settings  │  │  Export  │                        │    │
│  │  │   Page   │  │   Page   │                        │    │
│  │  └──────────┘  └──────────┘                        │    │
│  │                                                      │    │
│  │              IPC Communication                      │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
│                    Preload Script                            │
│                  (Context Bridge)                            │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐    │
│  │              Main Process (Backend)                   │    │
│  │                                                       │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │         Database Manager (SQLite)            │   │    │
│  │  │  ┌────────────┐  ┌────────────┐            │   │    │
│  │  │  │  expenses  │  │   income   │            │   │    │
│  │  │  │   table    │  │   table    │            │   │    │
│  │  │  └────────────┘  └────────────┘            │   │    │
│  │  │  ┌────────────┐                             │   │    │
│  │  │  │  settings  │                             │   │    │
│  │  │  │   table    │                             │   │    │
│  │  │  └────────────┘                             │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                       │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │            File System Manager               │   │    │
│  │  │         (CSV Export, Data Storage)           │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Electron Process Architecture

#### Main Process

**Responsibilities:**
- Application lifecycle management (launch, quit)
- Window creation and management
- SQLite database initialization and connection
- IPC handler registration for database operations
- File system operations (CSV export, database file management)
- Native dialog management (save file dialogs)

**Key Modules:**
- `main.js`: Entry point, window creation, app lifecycle
- `database.js`: SQLite connection, schema initialization, query execution
- `ipc-handlers.js`: IPC event handlers for CRUD operations
- `file-manager.js`: CSV export and file system operations

#### Renderer Process

**Responsibilities:**
- User interface rendering (HTML/CSS)
- User interaction handling
- Chart rendering (Chart.js)
- IPC communication with main process
- Client-side validation and error display
- UI state management

**Key Modules:**
- `index.html`: Dashboard page structure
- `transactions.html`: Transaction list page structure
- `statistics.html`: Statistics and charts page structure
- `settings.html`: Settings page structure
- `renderer.js`: Shared UI logic and IPC communication
- `charts.js`: Chart.js initialization and data visualization
- `theme.js`: Theme switching logic (light/dark mode)

#### Preload Script

**Purpose:** Creates a secure bridge between renderer and main processes using contextBridge API.

**Exposed API (`window.api`):**

```javascript
{
  // Income operations
  addIncome: (data) => Promise,
  getIncomes: () => Promise,
  updateIncome: (id, data) => Promise,
  deleteIncome: (id) => Promise,
  
  // Expense operations
  addExpense: (data) => Promise,
  getExpenses: () => Promise,
  updateExpense: (id, data) => Promise,
  deleteExpense: (id) => Promise,
  
  // Statistics
  getStatistics: () => Promise,
  
  // Settings
  getSettings: () => Promise,
  updateSettings: (data) => Promise,
  
  // Export
  exportToCSV: () => Promise
}
```

#### IPC Communication

**Channel Design:**

| Channel Name | Direction | Purpose | Data Format |
|-------------|-----------|---------|-------------|
| `income:add` | Renderer → Main | Create income entry | `{title, amount, date, note}` |
| `income:get` | Renderer → Main | Retrieve all incomes | None |
| `income:update` | Renderer → Main | Update income entry | `{id, title, amount, date, note}` |
| `income:delete` | Renderer → Main | Delete income entry | `{id}` |
| `expense:add` | Renderer → Main | Create expense entry | `{title, amount, category, date, note}` |
| `expense:get` | Renderer → Main | Retrieve all expenses | None |
| `expense:update` | Renderer → Main | Update expense entry | `{id, title, amount, category, date, note}` |
| `expense:delete` | Renderer → Main | Delete expense entry | `{id}` |
| `stats:get` | Renderer → Main | Get dashboard statistics | None |
| `settings:get` | Renderer → Main | Retrieve settings | None |
| `settings:update` | Renderer → Main | Update settings | `{currency, theme}` |
| `export:csv` | Renderer → Main | Export data to CSV | None |

**Error Handling Pattern:**
All IPC handlers return promises that resolve with `{success: true, data}` or `{success: false, error}`.

---

## Database Design

### Schema

#### expenses Table

```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  note TEXT
);
```

**Indexes:**
```sql
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
```

#### income Table

```sql
CREATE TABLE income (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  date TEXT NOT NULL,
  note TEXT
);
```

**Indexes:**
```sql
CREATE INDEX idx_income_date ON income(date);
```

#### settings Table

```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  currency TEXT NOT NULL DEFAULT 'USD',
  theme TEXT NOT NULL DEFAULT 'Light'
);
```

The settings table always contains exactly one row (`id = 1`). Updates use `UPDATE ... WHERE id = 1`.

### Table Relationships

```
┌────────────────────┐     ┌────────────────────┐
│       income       │     │      expenses       │
├────────────────────┤     ├────────────────────┤
│ id (PK, AUTOINCR.) │     │ id (PK, AUTOINCR.) │
│ title              │     │ title              │
│ amount             │     │ amount             │
│ date               │     │ category           │
│ note               │     │ date               │
└────────────────────┘     │ note               │
                           └────────────────────┘
               ┌────────────────────┐
               │      settings      │
               ├────────────────────┤
               │ id (PK, DEFAULT 1) │
               │ currency           │
               │ theme              │
               └────────────────────┘
```

**Note:** There are no foreign key relationships between tables. Income and expense entries are independent records. The settings table is a singleton.

### Data Types

| Field | SQLite Type | Notes |
|-------|------------|-------|
| id | INTEGER | Auto-incremented primary key |
| title | TEXT | Non-empty string |
| amount | REAL | Positive decimal number |
| category | TEXT | Expense only; from predefined list |
| date | TEXT | ISO 8601 format: `YYYY-MM-DD` |
| note | TEXT | Optional; nullable |
| currency | TEXT | Three-letter code (e.g., `USD`, `EUR`) |
| theme | TEXT | `Light` or `Dark` |

### Database File Location

The SQLite database file is stored in the OS-specific user data directory provided by Electron:

- **Windows:** `%APPDATA%\personal-expense-tracker\expense-tracker.db`
- **macOS:** `~/Library/Application Support/personal-expense-tracker/expense-tracker.db`
- **Linux:** `~/.config/personal-expense-tracker/expense-tracker.db`

---

## Components and Interfaces

### Folder Structure

```
personal-expense-tracker/
├── main.js                    # Electron main process entry
├── preload.js                 # Context bridge preload script
├── package.json               # Dependencies and scripts
├── package-lock.json
│
├── src/
│   ├── main/                  # Main process modules
│   │   ├── database.js        # SQLite connection + schema setup
│   │   ├── ipc-handlers.js    # IPC event registration
│   │   └── file-manager.js    # CSV export, file I/O
│   │
│   └── renderer/              # Renderer process assets
│       ├── pages/
│       │   ├── index.html     # Dashboard page
│       │   ├── transactions.html
│       │   ├── statistics.html
│       │   └── settings.html
│       │
│       ├── js/
│       │   ├── renderer.js    # Core UI logic + IPC communication
│       │   ├── dashboard.js   # Dashboard page logic
│       │   ├── transactions.js # Transaction list, search, filter
│       │   ├── statistics.js  # Chart rendering (Chart.js)
│       │   ├── settings.js    # Settings page logic
│       │   ├── form-validator.js # Client-side validation
│       │   └── theme.js       # Theme switching
│       │
│       ├── css/
│       │   ├── main.css       # Global styles, layout, variables
│       │   ├── components.css # Cards, buttons, forms, tables
│       │   ├── themes.css     # Light/dark theme CSS variables
│       │   └── charts.css     # Chart container styles
│       │
│       └── assets/
│           └── icons/         # SVG icons
│
└── .kiro/
    └── specs/
        └── personal-expense-tracker/
            ├── requirements.md
            └── design.md
```

---

## Application Navigation Flow

The application uses a single-window, multi-page architecture. Pages are swapped in-place within the main window using HTML navigation.

```
┌──────────────────────────────────────────────────────────────┐
│                    Application Window                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Navigation Bar                        │ │
│  │  [Dashboard] [Transactions] [Statistics] [Settings]     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Active Page Content                     │ │
│  │                                                          │ │
│  │   ┌────────────┐   ┌────────────┐   ┌────────────┐     │ │
│  │   │  Dashboard  │   │Transactions│   │ Statistics │     │ │
│  │   │  (default)  │   │    List    │   │  & Charts  │     │ │
│  │   └────────────┘   └────────────┘   └────────────┘     │ │
│  │                                                          │ │
│  │           ┌──────────────────┐                          │ │
│  │           │     Settings     │                          │ │
│  │           └──────────────────┘                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Floating Action Buttons                     │ │
│  │         [+ Add Income]  [+ Add Expense]                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Navigation State:**
- The current active page is tracked in a JavaScript variable (`currentPage`)
- Navigation between pages loads data fresh from the database via IPC
- The add income/expense modal is accessible from any page

---

## UI Page Structure

### Dashboard Page (`index.html`)

```
┌──────────────────────────────────────────────────┐
│              Summary Cards Row                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │ Balance  │ │  Income  │ │ Expenses │ │Trans.│ │
│  │  $XXXX   │ │  $XXXX   │ │  $XXXX   │ │  XX  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────┘ │
│                                                    │
│  ┌──────────────────┐  ┌──────────────────────┐   │
│  │   Expense Chart  │  │  Recent Transactions │   │
│  │   (Pie/Doughnut) │  │   (Last 10, desc.)   │   │
│  │                  │  │                      │   │
│  └──────────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────┘
```

**Data Sources:**
- Balance = SUM(income.amount) - SUM(expenses.amount)
- Recent transactions: UNION of income and expenses, ORDER BY date DESC LIMIT 10

### Transaction List Page (`transactions.html`)

```
┌──────────────────────────────────────────────────┐
│  [Search bar]  [Category filter] [Date range]    │
│                                         [Export] │
├──────────────────────────────────────────────────┤
│ Date     │ Title       │ Category  │ Amount │ ⋮  │
├──────────────────────────────────────────────────┤
│ YYYY-MM  │ Lorem ipsum │ Food      │ $XX.XX │ ⋮  │
│ YYYY-MM  │ Lorem ipsum │ Income    │ $XX.XX │ ⋮  │
│ ...                                              │
└──────────────────────────────────────────────────┘
```

### Statistics Page (`statistics.html`)

```
┌──────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Income  │  │ Expenses │  │ Balance  │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │    Pie Chart: Expenses by Category          │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │    Bar Chart: Monthly Expenses              │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Settings Page (`settings.html`)

```
┌──────────────────────────────────────────────────┐
│  Currency                                         │
│  ┌─────────────────────────────────────────────┐  │
│  │  [USD ▼]                                    │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  Theme                                            │
│  ┌─────────────────────────────────────────────┐  │
│  │  [ Light ○ ]   [ Dark ● ]                   │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  Export Data                                      │
│  ┌─────────────────────────────────────────────┐  │
│  │  [Export All Transactions to CSV]           │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Add/Edit Modal (Shared)

```
┌──────────────────────────────────────────────┐
│  [x]      Add Expense / Edit Expense          │
│──────────────────────────────────────────────│
│  Title*     [                             ]   │
│  Amount*    [         ] [Currency symbol]     │
│  Category*  [Food              ▼         ]   │
│  Date*      [YYYY-MM-DD        ]             │
│  Note       [                             ]   │
│                                               │
│  [  Cancel  ]               [  Save  ]        │
└──────────────────────────────────────────────┘
```

---

## Data Models

### Income Entry

```javascript
{
  id: Number,         // Auto-increment, assigned by DB
  title: String,      // Required, non-empty
  amount: Number,     // Required, positive decimal
  date: String,       // Required, YYYY-MM-DD
  note: String|null   // Optional
}
```

### Expense Entry

```javascript
{
  id: Number,         // Auto-increment, assigned by DB
  title: String,      // Required, non-empty
  amount: Number,     // Required, positive decimal
  category: String,   // Required, from CATEGORIES list
  date: String,       // Required, YYYY-MM-DD
  note: String|null   // Optional
}
```

### Settings

```javascript
{
  currency: String,   // Currency code, e.g., "USD"
  theme: String       // "Light" or "Dark"
}
```

### Statistics Aggregate

```javascript
{
  totalIncome: Number,
  totalExpenses: Number,
  balance: Number,
  transactionCount: Number,
  expensesByCategory: [{ category: String, total: Number }],
  expensesByMonth: [{ month: String, total: Number }]
}
```

### Default Categories

```javascript
const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Other"
];
```

### Currency Options

```javascript
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" }
];
```

---

## Data Flow

### CRUD Operations Flow

#### Add Transaction

```
User fills form → Client validation → IPC send
     │
     ▼
Main process receives IPC event
     │
     ▼
Server-side validation (amount > 0, title non-empty)
     │
     ▼
SQLite INSERT
     │
     ▼
Return {success: true, data: newRecord} or {success: false, error}
     │
     ▼
Renderer handles response
     │
     ├─ Success → Close modal → Refresh current page data → Update UI
     └─ Error   → Display error message in modal
```

#### Edit Transaction

```
User clicks edit → Load record into form → User modifies → Submit
     │
     ▼
Client validation
     │
     ▼
IPC send (update:income or update:expense) with id
     │
     ▼
SQLite UPDATE WHERE id = ?
     │
     ▼
Return result → Refresh UI
```

#### Delete Transaction

```
User clicks delete → Confirmation dialog → IPC delete send
     │
     ▼
SQLite DELETE WHERE id = ?
     │
     ▼
Return result → Remove row from UI → Update summary cards
```

#### Read / Dashboard Load

```
Page load event
     │
     ▼
IPC send stats:get
     │
     ▼
Main process runs aggregate SQL queries:
  - SELECT SUM(amount) FROM income
  - SELECT SUM(amount) FROM expenses
  - SELECT COUNT(*) FROM (income UNION expenses)
  - SELECT * FROM (income UNION expenses) ORDER BY date DESC LIMIT 10
  - SELECT category, SUM(amount) FROM expenses GROUP BY category
     │
     ▼
Return aggregate object
     │
     ▼
Renderer updates summary cards + renders Chart.js charts
```

### Settings Data Flow

```
User changes currency/theme
     │
     ▼
IPC settings:update
     │
     ▼
SQLite UPDATE settings SET ... WHERE id = 1
     │
     ▼
Return success
     │
     ├─ Currency change → Re-render all monetary values
     └─ Theme change   → Toggle CSS class on <html> element
```

### CSV Export Flow

```
User clicks "Export to CSV"
     │
     ▼
IPC export:csv
     │
     ▼
Main process: query all income + expenses
     │
     ▼
Build CSV string:
  - Header row: type,title,amount,category,date,note
  - Income rows: income,title,amount,,date,note
  - Expense rows: expense,title,amount,category,date,note
     │
     ▼
dialog.showSaveDialog({ filters: [{name: 'CSV', extensions: ['csv']}] })
     │
     ├─ User cancelled → Return {success: false, cancelled: true}
     │
     ▼
fs.writeFile(selectedPath, csvString)
     │
     ├─ Success → Return {success: true} → Show success notification
     └─ Error   → Return {success: false, error} → Show error message
```

---

## Correctness Properties

Property-based testing (PBT) is **not applicable** to this feature. The Personal Expense Tracker is composed of CRUD operations against SQLite, UI rendering, Chart.js visualization, and file I/O. There are no pure functions over large input spaces where generating 100+ random inputs would reveal bugs beyond what example-based tests would catch. Validation logic (non-empty title, positive amount), data persistence, and CSV generation are all better covered by targeted example-based unit and integration tests.

See the Testing Strategy section for the recommended test approach.

### Property 1: Amount validation rejects non-positive values

*For any* income or expense entry where the amount is zero or negative, the application SHALL reject the entry and the database SHALL remain unchanged.

**Validates: Requirements 3.3, 3.4, 4.3, 4.4, 9.6**

### Property 2: Transaction persistence round-trip

*For any* valid income or expense entry that is created, reading back all transactions from the database SHALL include a record whose fields match the created entry.

**Validates: Requirements 3.1, 3.2, 3.7, 4.1, 4.2, 4.8, 9.1**

### Property 3: CSV export contains all transactions

*For any* set of transactions in the database, the generated CSV file SHALL contain exactly one data row per transaction with the correct type, title, amount, category, date, and note values.

**Validates: Requirements 8.1, 8.2**

---

## Error Handling

### Validation Layer (Client-Side)

All form validation runs before sending IPC requests:

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| title | Non-empty after trim | "Title is required" |
| amount | Numeric, > 0 | "Amount must be a positive number" |
| category | Non-empty (expenses) | "Please select a category" |
| date | Valid date format | "Please select a valid date" |

### IPC Layer

Every IPC handler is wrapped in try/catch and returns a consistent response envelope:

```javascript
// Success
{ success: true, data: result }

// Error
{ success: false, error: "Human-readable error message" }
```

### Database Layer

- SQLite `CHECK(amount > 0)` constraint provides a second validation safety net
- Write errors are caught and returned via the IPC error envelope
- The application retains the last valid state on write failures (no partial updates)
- All database operations use parameterized queries to prevent SQL injection

### UI Layer

- Modal error messages appear inline within the form (below the affected field)
- Toast/notification messages for non-modal errors (export failures, DB errors)
- Empty state messages when no data exists (charts, transaction list)

### Error Message Examples

```
Dashboard: "No expense data available. Add some expenses to see charts."
Export:     "Export failed: Unable to write to the selected location."
Form:       "Amount must be a positive number."
DB Error:   "Failed to save. Please try again."
```

---

## Local Data Storage Strategy

- The database file is stored in `app.getPath('userData')` which resolves to the OS-specific user data directory
- The directory is created automatically by Electron if it does not exist
- On first launch, `database.js` checks if the DB file exists; if not, it runs the schema initialization SQL
- The settings table always contains exactly one row, seeded on first initialization
- All writes use synchronous-mode `better-sqlite3` to simplify error handling and avoid race conditions

### Why `better-sqlite3` over `sqlite3`

`better-sqlite3` provides a synchronous API which is safer for single-user desktop apps:
- No callback complexity
- Simpler error handling with try/catch
- Better performance for small datasets
- Atomic transactions are trivial to implement

---

## Theme Management

### CSS Variable Approach

Themes are implemented using CSS custom properties on the `<html>` element. Switching themes adds/removes a `data-theme="dark"` attribute.

```css
/* themes.css */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --accent-color: #4caf50;
  --card-bg: #ffffff;
  --border-color: #e0e0e0;
  --danger: #e53935;
  --income-color: #43a047;
  --expense-color: #e53935;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #f0f0f0;
  --text-secondary: #b0b0b0;
  --accent-color: #66bb6a;
  --card-bg: #2d2d2d;
  --border-color: #444444;
}
```

### Theme Switching Logic

```javascript
// theme.js
function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'Dark') {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.removeAttribute('data-theme');
  }
}

// On settings change
async function onThemeChange(newTheme) {
  await window.api.updateSettings({ theme: newTheme });
  applyTheme(newTheme);
}

// On app load
async function initTheme() {
  const settings = await window.api.getSettings();
  applyTheme(settings.theme);
}
```

Chart.js charts are re-rendered when theme changes to update axis colors and legends.

---

## Security Considerations for Electron

### Context Isolation

`contextIsolation: true` is set in BrowserWindow webPreferences. This ensures the renderer process cannot access Node.js APIs directly.

### Node Integration Disabled

`nodeIntegration: false` prevents the renderer from requiring Node.js modules, eliminating the largest attack surface in Electron apps.

### Context Bridge

The preload script uses `contextBridge.exposeInMainWorld` to expose only the specific API methods the renderer needs—no more, no less.

### Content Security Policy

A CSP header restricts the renderer to only load local resources:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
```

(`unsafe-inline` styles are acceptable for this personal app since there is no remote content.)

### Parameterized SQL Queries

All database operations use prepared statements to prevent SQL injection:

```javascript
const stmt = db.prepare('INSERT INTO expenses (title, amount, category, date, note) VALUES (?, ?, ?, ?, ?)');
stmt.run(title, amount, category, date, note);
```

### No Remote Code Execution

`webPreferences.webSecurity: true` (default) and no `allowRunningInsecureContent`. The app never loads remote URLs in the application window.

### File Access

File system access is scoped to:
- Reading/writing the SQLite database in `app.getPath('userData')`
- Writing CSV exports to user-selected paths via `dialog.showSaveDialog`

No arbitrary file access is exposed to the renderer.

---

## Technology Decisions and Justifications

| Technology | Decision | Justification |
|-----------|---------|--------------|
| **Electron.js** | Cross-platform desktop framework | Single codebase for Windows, macOS, Linux; familiar web technologies |
| **SQLite (`better-sqlite3`)** | Local relational database | Zero-config, single-file storage; perfect for personal offline apps; synchronous API simplifies code |
| **Vanilla JavaScript** | No frontend framework | Reduces dependency complexity; sufficient for a small single-user app; no build toolchain needed |
| **Chart.js** | Data visualization | Lightweight; simple API; built-in chart types (pie, bar) match all statistical requirements; good theming support |
| **CSS Custom Properties** | Theme system | Native browser feature; no JavaScript required for theme propagation; simple light/dark switching |
| **Multi-page HTML** | Navigation approach | Simpler than a SPA for this scale; no router needed; each page loads fresh data |
| **IPC + contextBridge** | Process communication | Secure by design; maintains Electron security best practices; clear separation between UI and data |

---

## Testing Strategy

Property-based testing (PBT) is **not applicable** to this feature because:

- The application is primarily composed of CRUD operations, UI rendering, and file I/O
- There are no pure functions with large input spaces where PBT would provide meaningful additional coverage
- The validation logic (non-empty title, positive amount) is better verified with targeted example-based tests

**Recommended Testing Approach:**

### Unit Tests (Example-Based)

- **Form validation logic** (`form-validator.js`): Test each validation rule with valid and invalid inputs (empty title, zero amount, negative amount, whitespace-only title)
- **Statistics calculations**: Test the aggregate query results with known datasets
- **CSV generation**: Test the CSV builder function with a known set of transactions and verify the output format

### Integration Tests

- **Database operations**: Test each CRUD operation against an in-memory SQLite instance
- **Settings persistence**: Verify that theme and currency changes are saved and reloaded correctly
- **IPC handlers**: Test each handler with valid and invalid inputs

### Manual / Smoke Tests

- **App initialization**: Verify DB is created and schema is correct on first launch
- **Cross-platform**: Verify the app builds and runs on Windows, macOS, and Linux
- **CSV export**: Verify the native save dialog appears and the file is written correctly
- **Theme persistence**: Verify the selected theme is restored after app restart

---

## Future Scalability Considerations

The design is intentionally kept simple for personal use, but the following paths are available if the app needs to grow:

1. **Multiple accounts/wallets**: Add an `accounts` table and a foreign key on `expenses.account_id` and `income.account_id`
2. **Recurring transactions**: Add a `recurring` boolean and `recurrence_interval` column; a scheduled job in the main process can auto-create entries
3. **Budget limits by category**: Add a `budgets` table with `category` and `limit_amount` columns; compare against expense totals in the statistics module
4. **Data backup/restore**: The SQLite file can be copied directly; expose a backup option in Settings using `fs.copyFile`
5. **Additional currencies**: Extend the CURRENCIES array; consider fetching live exchange rates if internet connectivity is later added
6. **Pagination**: Add `LIMIT` and `OFFSET` to transaction queries when the dataset grows large; add page controls to the Transaction List UI
7. **Tags/custom categories**: Replace the static CATEGORIES list with a `categories` table that users can manage
8. **PDF reports**: Add a PDF export option using a library like `pdfkit` in the main process alongside the existing CSV export
