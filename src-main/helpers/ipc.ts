import { ipcMain } from 'electron'
import { getFileContent, saveFile, selectFile, selectFolder, selectOutputFile, selectOutputFolder } from './filePicker'
import { preparePresentation } from '../presentation/presentation'
import { z } from 'zod'
import { exportPdf } from '../export/exportPdf'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', selectFile)
    ipcMain.handle('dialog:selectFolder', selectFolder)
    ipcMain.handle('dialog:selectOutputFolder', selectOutputFolder)
    ipcMain.handle('dialog:selectOutputFile', (_, filter) => {
        // TODO: parse filter with zod, but I don't know how ✌🏼
        return selectOutputFile(filter)
    })
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
    ipcMain.handle('export:pdf', (_, arg1) => {
        const outputPath = z.string().parse(arg1)
        return exportPdf(outputPath)
    })
}

export function unregisterIpc() {
    ipcMain.removeHandler('dialog:selectFile')
    ipcMain.removeHandler('dialog:selectFolder')
    ipcMain.removeHandler('dialog:selectOutputFolder')
    ipcMain.removeHandler('dialog:selectOutputFile')
    ipcMain.removeHandler('file:save')
    ipcMain.removeHandler('file:getContent')
    ipcMain.removeHandler('presentation:prepare')
    ipcMain.removeHandler('export:pdf')
}
