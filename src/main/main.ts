import { app, BrowserWindow, Menu, Tray } from 'electron';
import path from 'path';
import { getHostsFileContent, setHostsFileContent } from './hostsFile';
import { initTimer, timerEmitter } from "./timerState";
import { EVENTS } from '../shared/constants';


// GOOD - stays alive
let appIcon: Tray | null = null; // Module level

function initApp() {
  initTimer();
  createSettingsWindow();
  createBreakWindow();

  // createWindow();
}

function createSettingsWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(`${process.env.VITE_DEV_SERVER_URL}/settings/`);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/settings/index.html'));
  }

  win.on('close', (event) => {
    event.preventDefault();
    win.hide();
  })

  appIcon = new Tray(path.join(__dirname, '../assets/dog.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Settings', click: () => { win.show() } },
    { label: 'Quit', click: () => { win.destroy() } },
  ])
  
  appIcon.setContextMenu(contextMenu);
  console.log(appIcon)
}

function createBreakWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(`${process.env.VITE_DEV_SERVER_URL}/break/`);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/break/index.html'));
  }
}


function createWindow() {

  const win = new BrowserWindow();
  // win.setKiosk(true);
  timerEmitter.on(EVENTS.TIMER.START_BREAK, () => {
    console.log('break started')
  })

  // In dev: load from Vite server (http://localhost:5173)
  // In prod: load from built files
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  // setHostsFileContent();
}

app.whenReady().then(initApp);