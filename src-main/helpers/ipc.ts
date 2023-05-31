import { ipcMain } from 'electron'
import {
    getFileContent,
    saveChangesDialog,
    saveFile,
    selectFile,
    selectFolder,
    selectOutputFile,
    selectOutputFolder,
} from './files'
import { exportPdf } from '../export/exportPdf'
import { exportHtml } from '../export/exportHtml'
import { parseAndCachePresentation } from '../store'
import { wrapPromise } from '../../src-shared/errors/wrapPromise'
import { exportStandardTemplate } from './assets'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', (_, title, filters) => selectFile(title, filters))
    ipcMain.handle('dialog:selectFolder', (_, title) => selectFolder(title))
    ipcMain.handle('dialog:selectOutputFile', (_, title, filters) => selectOutputFile(title, filters))
    ipcMain.handle('dialog:selectOutputFolder', (_, title) => selectOutputFolder(title))
    ipcMain.handle('dialog:saveChanges', saveChangesDialog)
    ipcMain.handle('file:save', (_, filePath, content) => saveFile(filePath, content))
    ipcMain.handle('file:getContent', (_, filePath) => getFileContent(filePath))
    ipcMain.handle('presentation:parse', (_, parseRequest) => wrapPromise(parseAndCachePresentation(parseRequest)))
    ipcMain.handle('export:html', (_, exportRequest) => wrapPromise(exportHtml(exportRequest)))
    ipcMain.handle('export:pdf', (_, outputPath) => wrapPromise(exportPdf(outputPath)))
    ipcMain.handle('export:template', (_, outputPath) => wrapPromise(exportStandardTemplate(outputPath)))
}

export function unregisterIpc() {
    ipcMain.removeHandler('dialog:selectFile')
    ipcMain.removeHandler('dialog:selectFolder')
    ipcMain.removeHandler('dialog:selectOutputFolder')
    ipcMain.removeHandler('dialog:selectOutputFile')
    ipcMain.removeHandler('dialog:saveChanges')
    ipcMain.removeHandler('file:save')
    ipcMain.removeHandler('file:getContent')
    ipcMain.removeHandler('presentation:parse')
    ipcMain.removeHandler('export:html')
    ipcMain.removeHandler('export:pdf')
    ipcMain.removeHandler('export:template')
}
