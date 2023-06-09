import { ipcMain } from 'electron'
import {
    exists,
    basename,
    getFileContent,
    saveChangesDialog,
    saveFile,
    selectFile,
    selectFolder,
    selectOutputFile,
    selectOutputFolder,
    showItemInFolder,
} from './files'
import { exportPdf } from '../export/exportPdf'
import { exportHtml } from '../export/exportHtml'
import { parseAndCachePresentation } from '../store'
import { wrapPromise } from '../../src-shared/errors/wrapPromise'
import { exportStandardTemplate } from './assets'
import { addMedia } from '../presentation/media'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', (_, title, filters) => wrapPromise(selectFile(title, filters)))
    ipcMain.handle('dialog:selectFolder', (_, title) => wrapPromise(selectFolder(title)))
    ipcMain.handle('dialog:selectOutputFile', (_, title, filters) => wrapPromise(selectOutputFile(title, filters)))
    ipcMain.handle('dialog:selectOutputFolder', (_, title) => wrapPromise(selectOutputFolder(title)))
    ipcMain.handle('dialog:saveChanges', () => wrapPromise(saveChangesDialog()))
    ipcMain.handle('file:exists', (_, filePath) => exists(filePath))
    ipcMain.handle('file:basename', (_, filePath) => basename(filePath))
    ipcMain.handle('file:save', (_, filePath, content) => wrapPromise(saveFile(filePath, content)))
    ipcMain.handle('file:getContent', (_, filePath) => wrapPromise(getFileContent(filePath)))
    ipcMain.handle('file:addMedia', (_, filePath, markdownPath) => wrapPromise(addMedia(filePath, markdownPath)))
    ipcMain.handle('file:showItemInFolder', (_, filePath) => showItemInFolder(filePath))
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
    ipcMain.removeHandler('file:exists')
    ipcMain.removeHandler('file:basename')
    ipcMain.removeHandler('file:save')
    ipcMain.removeHandler('file:getContent')
    ipcMain.removeHandler('file:addMedia')
    ipcMain.removeHandler('file:showItemInFolder')
    ipcMain.removeHandler('presentation:parse')
    ipcMain.removeHandler('export:html')
    ipcMain.removeHandler('export:pdf')
    ipcMain.removeHandler('export:template')
}
