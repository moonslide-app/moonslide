import { ipcMain } from 'electron'
import { selectMarkdownFile } from './filePicker'

export function registerIpc() {
    ipcMain.handle('dialog:selectMarkdownFile', selectMarkdownFile)
}

export function unregisterIpc() {
    ipcMain.removeHandler('dialog:selectMarkdownFile')
}
