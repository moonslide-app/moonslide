import { ipcMain } from 'electron'
import { selectFile, selectFolder, selectOutputFolder } from './filePicker'
import { exportPresentation, preparePresentation } from './presentation'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', selectFile)
    ipcMain.handle('dialog:selectFolder', selectFolder)
    ipcMain.handle('dialog:selectOutputFolder', selectOutputFolder)
    ipcMain.handle('exportPresentation', (_, arg1, arg2, arg3) => exportPresentation(arg1, arg2, arg3))
    ipcMain.handle('preparePresentation', (_, arg1, arg2) => preparePresentation(arg1, arg2))
}

export function unregisterIpc() {
    ipcMain.removeHandler('dialog:selectFile')
    ipcMain.removeHandler('dialog:selectFolder')
    ipcMain.removeHandler('dialog:selectOutputFolder')
    ipcMain.removeHandler('exportPresentation')
    ipcMain.removeHandler('preparePresentation')
}
