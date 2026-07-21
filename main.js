'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getDb } = require('./src/main/database');
const { registerHandlers } = require('./src/main/ipc-handlers');

/**
 * Creates the main application window.
 * Security settings follow Electron best practices:
 *   - contextIsolation: true  — renderer cannot access Node.js directly
 *   - nodeIntegration: false  — no require() in renderer
 *   - preload                 — controlled API surface via contextBridge
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'src', 'renderer', 'assets', 'icons', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the Dashboard page (built in Task 17 — Phase 4)
  win.loadFile(path.join(__dirname, 'src', 'renderer', 'pages', 'index.html'));

  return win;
}

app.whenReady().then(() => {
  // Initialise the SQLite database before the window opens.
  // app.getPath('userData') resolves to the OS-specific user data directory:
  //   Windows : %APPDATA%\personal-expense-tracker
  //   macOS   : ~/Library/Application Support/personal-expense-tracker
  //   Linux   : ~/.config/personal-expense-tracker
  getDb(app.getPath('userData'));

  // Register all IPC handlers (income, expense, stats, settings, export:csv).
  // The window reference is required by the export:csv handler so the native
  // save dialog is displayed as a modal child of the main window.
  const win = createWindow();
  registerHandlers(ipcMain, win);

  // macOS: re-create the window when the dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Windows / Linux: quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
