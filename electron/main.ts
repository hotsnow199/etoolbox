import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";

let win: BrowserWindow | null = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  setupMenu();
  setupIpcMain();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function createWindow() {
  win = new BrowserWindow({
    title: 'Web Toolbox',
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.on('closed', () => win = null);

  loadApplication();
}

function setupIpcMain() {
  ipcMain.on('rendererAppStarted', () => console.log('main.ts: app started'));
}

function loadApplication() {
  if (!win) {
    return;
  }

  if (isDev) {
    win.loadURL('http://localhost:3000/index.html');
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      forceHardReset: true,
      hardResetMethod: 'exit'
    });
  }

  // DevTools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
}

function setupMenu() {
  const template: any = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Refresh',
          accelerator: 'Ctrl+Alt+R',
          click: loadApplication
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          role: 'quit'
        }
      ]
    },
    {
      label: '?',
      submenu: [
        {
          label: 'About...',
          accelerator: 'Ctrl+Alt+A',
          click: () => win!.webContents.send('navigateTo', 'about')
        },
        {
          type: 'separator'
        },
        {
          label: "Dev tools...",
          accelerator: 'Ctrl+Alt+D',
          click: () => {
            win!.webContents.toggleDevTools();
          }
        },
      ]
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({ label: '' });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
