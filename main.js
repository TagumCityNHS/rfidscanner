const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');
const { handleQrScan } = require('./services/scanController'); 
let mainWindow;
let wss;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    fullscreen: true,
    icon: path.join(__dirname, './tv/tcnhs.png'), // Set the icon property
    webPreferences: {
      preload: path.join(__dirname, 'tv', 'preload.js'),
    },
  });
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile(path.join(__dirname, 'tv', 'index.html'));
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  console.log('NFC scanning system initialized');

  // Set up WebSocket server
  wss = new WebSocket.Server({ port: 8080 });
  wss.on('connection', ws => {
    console.log('WebSocket connection established');
  
    ws.on('message', message => {
      if (mainWindow) {
        mainWindow.webContents.send('update-text', message.toString()); // Send message to renderer process
      }
    });
  });
  
  ipcMain.on('validate-lrn', async (event, lrn) => {
    try {
      const timestamp = new Date(); // Use the current timestamp or provide a timestamp if available
      const scanner = 5; // The identifier for scanner 5

      const result = await handleQrScan(lrn, timestamp, scanner);
      event.reply('scanner5-validation-result', result); 
    } catch (error) {
      console.error('Error validating LRN:', error);
      event.reply('scanner5-validation-result', { message: 'Scan failed. Internal Server Error' });
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
