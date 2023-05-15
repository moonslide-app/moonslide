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
import { parse } from '../parse'
import { exportPdf } from '../export/exportPdf'
import { exportHtml } from '../export/exportHtml'
import {
    clearPreviewFolder,
    openPreviewWindow,
    preparePresentationForPreview,
    reloadPreviewWindow,
} from '../presentation/preview'

export function registerIpc() {
    ipcMain.handle('dialog:selectFile', (_, arg1, arg2) => selectFile(arg1, arg2))
    ipcMain.handle('dialog:selectFolder', (_, arg1) => selectFolder(arg1))
    ipcMain.handle('dialog:selectOutputFile', (_, arg1, arg2) => selectOutputFile(arg1, arg2))
    ipcMain.handle('dialog:selectOutputFolder', (_, arg1) => selectOutputFolder(arg1))
    ipcMain.handle('dialog:saveChanges', saveChangesDialog)
    ipcMain.handle('file:save', (_, arg1, arg2) => saveFile(arg1, arg2))
    ipcMain.handle('file:getContent', (_, arg1) => getFileContent(arg1))
    ipcMain.handle('presentation:parse', (_, arg1) => parse(arg1))
    ipcMain.handle('preview:clearOutFolder', clearPreviewFolder)
    ipcMain.handle('preview:prepare', (_, arg1) => preparePresentationForPreview(arg1))
    ipcMain.handle('preview:show', openPreviewWindow)
    ipcMain.handle('preview:reload', reloadPreviewWindow)
    ipcMain.handle('export:html', (_, arg1) => exportHtml(arg1))
    ipcMain.handle('export:pdf', (_, arg1) => exportPdf(arg1))
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
    ipcMain.removeHandler('preview:clearOutFolder')
    ipcMain.removeHandler('preview:prepare')
    ipcMain.removeHandler('preview:show')
    ipcMain.removeHandler('preview:reload')
    ipcMain.removeHandler('export:html')
    ipcMain.removeHandler('export:pdf')
}
