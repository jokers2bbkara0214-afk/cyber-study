"use strict";
const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const APP_ROOT = path.join(__dirname, 'app');
const INDEX = path.join(APP_ROOT, 'index.html');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 960, minHeight: 640,
    title: 'CYBER STUDY 4.0', backgroundColor: '#121c20',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      devTools: true
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    const target = new URL(url);
    if (target.protocol === 'file:') {
      const targetPath = decodeURIComponent(target.pathname).replace(/^\/([A-Za-z]:)/, '$1');
      const relative = path.relative(APP_ROOT, targetPath);
      if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) return;
    }
    event.preventDefault();
    if (target.protocol === 'https:') shell.openExternal(url);
  });
  win.loadFile(INDEX).catch((error) => {
    dialog.showErrorBox('CYBER STUDY 起動エラー', String(error));
  });
}
app.whenReady().then(() => {
  if (!fs.existsSync(INDEX)) { dialog.showErrorBox('起動エラー', 'index.html が見つかりません'); app.quit(); return; }
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
