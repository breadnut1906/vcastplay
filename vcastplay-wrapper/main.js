const { app, screen, BrowserWindow, ipcMain, Menu, session, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');

const systemFunc = require('./modules/system')
const updater = require('./modules/autoUpdater');
const downloader = require("./modules/downloader");

const isDev = !app.isPackaged;

let win;

/**
 * Creates a new browser window with the specified configuration.
 * The window is initialized in fullscreen mode and uses a preload script.
 * In production, it loads the built Angular app from the local filesystem.
 * In development, it connects to the Angular live server at localhost:4200.
 */

async function createWindow() {
  try {
    await session.defaultSession.setProxy({ mode: "system" });

    const display = screen.getPrimaryDisplay();

    win = new BrowserWindow({
      alwaysOnTop: true,
      fullscreenable: true,
      fullscreen: !isDev,
      autoHideMenuBar: true,
      width: display.size.width,
      height: display.size.height,
      // width: 1000,         // custom width
      // height: 700,         // custom height
      // x: 0,              // position from left
      // y: 0,              // position from top
      frame: false,        // remove default OS window frame
      // resizable: false,    // disable resizing (optional)
      transparent: false,  // set to true if you want transparent background
      hasShadow: false,    // set to true if you want a shadow
      icon: path.join(__dirname, 'assets/favicon.png'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });  

    win.on('close', (event) => {
      if (!app.isQuiting) {
        event.preventDefault();
        win.hide();
      }
    })

    await systemFunc.onCreateTray(win).then(tray => {
      tray.on('click', () => {
        win.isVisible() ? win.hide() : win.show();
      });
    });

    if (isDev) {
      // 🟢 DEV: Use Angular live server
      win.loadURL('http://localhost:4200');
      win.webContents.openDevTools();
    } else {
      // 🟢 PROD: Use built Angular app
      win.loadFile('dist/player/browser/index.html');
      
      // Disable dev tools
      win.webContents.on('devtools-opened', () => {
        win.webContents.closeDevTools();
      });

      // Disable menu
      Menu.setApplicationMenu(null);

      updater.onSetupAutoUpdate();
    }
  } catch (error) {
    dialog.showErrorBox('Error', error);
  }
}

async function onOpenLibreHardwareMonitor() {
  const lhm = !isDev
    ? path.join(process.resourcesPath, 'lhm', 'LibreHardwareMonitor.exe')
    : path.join(__dirname, 'lhm', 'LibreHardwareMonitor.exe');

  const isRunning = await systemFunc.onSystemCommand('find', 'LibreHardwareMonitor.exe');

  if (!isRunning) systemFunc.onSystemCommand('open', lhm);

  return true; // ✅ always return something
}

ipcMain.handle('control', async (_event, action, appName) => {
  return await systemFunc.onSystemCommand(action, appName);
});

ipcMain.handle('getSystemInfo', async () => {
  return await systemFunc.onGetSystemInfo();
});

ipcMain.handle('takeScreenshot', async () => {
  return await systemFunc.onTakeScreenShot();
});

ipcMain.handle('downloadFiles', (event, files) => {
  return downloader.onHandleDownloadFiles(event, files);
})

ipcMain.handle('onDeleteFolder', async (event, filePath) => {
  return await systemFunc.onDeleteFolder(filePath);
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

// Check for updates when Angular asks
ipcMain.on('check-for-updates', () => {
  log.info('Manual update check triggered');
  autoUpdater.checkForUpdatesAndNotify();
});

// Send settings to renderer
ipcMain.on('sendWindowData', async (event, data) => {
  if (!win) return;
  await systemFunc.onApplySettings(win, data);
});

// Send Content Playback logs
ipcMain.on('onSendContentLogs', async (event, data) => {
  await systemFunc.onSaveContentLogs(data);
});

// Delete Content Playback logs
ipcMain.handle('onDeleteContentLogs', async () => {
  return await systemFunc.onDeleteContentLogs();
});

ipcMain.handle('onGetDisplays', async () => {
  return await systemFunc.onGetDisplays();
});

app.whenReady().then(async () => {
  await onOpenLibreHardwareMonitor();
  await createWindow();
});

app.on('window-all-closed', () => app.quit());

app.on('before-quit', async () => {
  await systemFunc.onSystemCommand('close', 'LibreHardwareMonitor.exe')
})