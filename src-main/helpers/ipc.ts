import { ipcMain } from 'electron'
import { getFileContent, saveFile, selectFile, selectFolder, selectOutputFile, selectOutputFolder } from './filePicker'
import { clearPresentationFolder, preparePresentation, prepareTemplate } from '../presentation/presentation'
import { parse } from '../presentation/parser'
import { exportPdf } from '../export/exportPdf'
import { exportHtml } from '../export/exportHtml'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', selectFile)
    ipcMain.handle('dialog:selectFolder', selectFolder)
    ipcMain.handle('dialog:selectOutputFolder', selectOutputFolder)
    ipcMain.handle('file:save', (_, arg1, arg2) => saveFile(arg1, arg2))
    ipcMain.handle('file:getContent', (_, arg1) => getFileContent(arg1))
    ipcMain.handle('presentation:clearOutFolder', clearPresentationFolder)
    ipcMain.handle('presentation:prepareTemplate', (_, arg1) => prepareTemplate(arg1))
    ipcMain.handle('presentation:prepare', (_, arg1) => preparePresentation(arg1))
    ipcMain.handle('presentation:parse', (_, arg1) => parse(arg1))
    ipcMain.handle('dialog:selectOutputFile', (_, filter) => selectOutputFile(filter))
    ipcMain.handle('export:html', (_, arg1) => exportHtml(arg1))
    ipcMain.handle('export:pdf', (_, arg1) => exportPdf(arg1))
}

export function unregisterIpc() {
    ipcMain.removeHandler('dialog:selectFile')
    ipcMain.removeHandler('dialog:selectFolder')
    ipcMain.removeHandler('dialog:selectOutputFolder')
    ipcMain.removeHandler('dialog:selectOutputFile')
    ipcMain.removeHandler('file:save')
    ipcMain.removeHandler('file:getContent')
    ipcMain.removeHandler('presentation:clearOutFolder')
    ipcMain.removeHandler('presentation:prepareTemplate')
    ipcMain.removeHandler('presentation:prepare')
    ipcMain.removeHandler('presentation:parse')
    ipcMain.removeHandler('export:html')
    ipcMain.removeHandler('export:pdf')
}
