import { BrowserWindow, shell } from 'electron'
import { FILE_PROTOCOL_NAME, REVEAL_PROTOCOL_NAME, getFileSchemeUrlFromFileProtocol } from './protocol'

export function setupWindowOpenHandlers(mainWindow: BrowserWindow) {
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith(REVEAL_PROTOCOL_NAME)) {
            return { action: 'allow' }
        }

        if (url.startsWith(FILE_PROTOCOL_NAME)) {
            shell.openExternal(getFileSchemeUrlFromFileProtocol(url))
        } else {
            shell.openExternal(url)
        }
        return { action: 'deny' }
    })

    mainWindow.webContents.on('did-create-window', window => {
        // This is the handler for the opened preview-window
        window.webContents.setWindowOpenHandler(({ url }) => {
            if (url.startsWith(FILE_PROTOCOL_NAME)) shell.openExternal(getFileSchemeUrlFromFileProtocol(url))
            else shell.openExternal(url)
            return { action: 'deny' }
        })
    })
}
