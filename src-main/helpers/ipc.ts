import { ipcMain } from 'electron'
import { getFileContent, saveFile, selectFile, selectFolder, selectOutputFolder } from './filePicker'
import { preparePresentation } from '../presentation/presentation'
import { z } from 'zod'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', selectFile)
    ipcMain.handle('dialog:selectFolder', selectFolder)
    ipcMain.handle('dialog:selectOutputFolder', selectOutputFolder)
    ipcMain.handle('file:save', (_, arg1, arg2) => {
        const filePath = z.string().parse(arg1)
        const content = z.string().parse(arg2)
        return saveFile(filePath, content)
    })
    ipcMain.handle('file:getContent', (_, arg1) => {
        const filePath = z.string().parse(arg1)
        return getFileContent(filePath)
    })
    ipcMain.handle('presentation:prepare', (_, arg1, arg2) => {
        const content = z.string().parse(arg1)
        const templateFolderPath = z.string().parse(arg2)
        return preparePresentation(content, templateFolderPath)
    })
}

export function unregisterIpc() {
    ipcMain.removeHandler('dialog:selectFile')
    ipcMain.removeHandler('dialog:selectFolder')
    ipcMain.removeHandler('dialog:selectOutputFolder')
    ipcMain.removeHandler('file:save')
    ipcMain.removeHandler('file:getContent')
    ipcMain.removeHandler('presentation:prepare')
}
