import { app, BrowserWindow, protocol } from 'electron'
import path from 'path'
import { registerIpc, unregisterIpc } from './helpers/ipc'
import { registerProtocols, REVEAL_PROTOCOL_NAME } from './helpers/protocol'
import { setupMenu } from './menu/menu'
import { setupWindowOpenHandlers } from './helpers/windowOpenHandler'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit()
}

const createWindow = () => {
    const isMac = process.platform === 'darwin'
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        titleBarStyle: isMac ? 'hiddenInset' : 'default',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
        },
    })

    setupMenu(mainWindow)
    setupWindowOpenHandlers(mainWindow)

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
    }

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

protocol.registerSchemesAsPrivileged([
    { scheme: REVEAL_PROTOCOL_NAME, privileges: { standard: true, bypassCSP: true } },
])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

app.whenReady().then(() => {
    registerIpc()
    registerProtocols()

    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('quit', () => {
    unregisterIpc()
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
