import { app, ipcMain } from 'electron'
import { selectFile, selectFolder, selectOutputFolder } from './filePicker'
import { exportPresentation } from './presentation'
import { resolve } from 'path'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', selectFile)
    ipcMain.handle('dialog:selectFolder', selectFolder)
    ipcMain.handle('dialog:selectOutputFolder', selectOutputFolder)
    ipcMain.handle('exportPresentation', (_, arg1, arg2, arg3) => exportPresentation(arg1, arg2, arg3))
    ipcMain.handle('movePresentation', (_, arg1, arg2) =>
        exportPresentation(arg1, arg2, resolve(app.getPath('userData')))
    )
}

export function unregisterIpc() {
    ipcMain.removeHandler('dialog:selectFile')
    ipcMain.removeHandler('dialog:selectFolder')
    ipcMain.removeHandler('dialog:selectOutputFolder')
    ipcMain.removeHandler('exportPresentation')
    ipcMain.removeHandler('movePresentation')
}
