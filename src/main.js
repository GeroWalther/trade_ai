import { app, BrowserWindow, session } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Disable security warnings and restrictions
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  // Disable all security restrictions
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // Allow CORS from TradingView domains with a single value
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Methods': ['GET', 'POST', 'OPTIONS'],
        'Access-Control-Allow-Headers': ['*'],
        // Set comprehensive CSP for TradingView
        'Content-Security-Policy': [
          "default-src 'self' https://*.tradingview.com https://*.tradingview-widget.com https://s3.tradingview.com https://symbol-search.tradingview.com https://pine-facade.tradingview.com https://telemetry.tradingview.com https://s3-symbol-logo.tradingview.com https://scanner.tradingview.com; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tradingview.com https://*.tradingview-widget.com https://s3.tradingview.com; " +
            "connect-src 'self' https://*.tradingview.com https://*.tradingview-widget.com wss://*.tradingview.com https://s3.tradingview.com https://symbol-search.tradingview.com https://pine-facade.tradingview.com https://telemetry.tradingview.com https://scanner.tradingview.com; " +
            "img-src 'self' data: blob: https://*.tradingview.com https://*.tradingview-widget.com https://s3.tradingview.com https://s3-symbol-logo.tradingview.com; " +
            "style-src 'self' 'unsafe-inline' https://*.tradingview.com https://*.tradingview-widget.com; " +
            "font-src 'self' data: https://*.tradingview.com https://*.tradingview-widget.com; " +
            "frame-src 'self' https://*.tradingview.com https://*.tradingview-widget.com; " +
            "worker-src 'self' blob: https://*.tradingview.com https://*.tradingview-widget.com; " +
            "child-src 'self' blob: https://*.tradingview.com https://*.tradingview-widget.com;",
        ],
      },
    });
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
