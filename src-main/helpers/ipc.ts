import { ipcMain } from 'electron'
import { getFileContent, saveFile, selectFile, selectFolder, selectOutputFile, selectOutputFolder } from './filePicker'
import { parse } from '../presentation/parser'
import { exportPdf } from '../export/exportPdf'
import { exportHtml } from '../export/exportHtml'
import {
    clearPreviewFolder,
    openPreviewWindow,
    preparePresentationForPreview,
    reloadPreviewWindow,
} from '../presentation/preview'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', selectFile)
    ipcMain.handle('dialog:selectFolder', selectFolder)
    ipcMain.handle('dialog:selectOutputFolder', selectOutputFolder)
    ipcMain.handle('file:save', (_, arg1, arg2) => saveFile(arg1, arg2))
    ipcMain.handle('file:getContent', (_, arg1) => getFileContent(arg1))
    ipcMain.handle('presentation:parse', (_, arg1) => parse(arg1))
    ipcMain.handle('preview:clearOutFolder', clearPreviewFolder)
    ipcMain.handle('preview:prepare', (_, arg1) => preparePresentationForPreview(arg1))
    ipcMain.handle('preview:show', openPreviewWindow)
    ipcMain.handle('preview:reload', reloadPreviewWindow)
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
    ipcMain.removeHandler('presentation:parse')
    ipcMain.removeHandler('preview:clearOutFolder')
    ipcMain.removeHandler('preview:prepare')
    ipcMain.removeHandler('preview:show')
    ipcMain.removeHandler('preview:reload')
    ipcMain.removeHandler('export:html')
    ipcMain.removeHandler('export:pdf')
}
