import { ipcRenderer } from 'electron'
import { unwrapPromise } from '../../src-shared/errors/wrapPromise'

const files = {
    selectFile(title: string, filters?: Electron.FileFilter[]): Promise<string> {
        return unwrapPromise(ipcRenderer.invoke('dialog:selectFile', title, filters))
    },
    selectFolder(title: string): Promise<string> {
        return unwrapPromise(ipcRenderer.invoke('dialog:selectFolder', title))
    },
    selectOutputFile(title: string, filters?: Electron.FileFilter[]): Promise<string> {
        return unwrapPromise(ipcRenderer.invoke('dialog:selectOutputFile', title, filters))
    },
    selectOutputFolder(title: string): Promise<string> {
        return unwrapPromise(ipcRenderer.invoke('dialog:selectOutputFolder', title))
    },
    showSaveChangesDialog(): Promise<boolean> {
        return unwrapPromise(ipcRenderer.invoke('dialog:saveChanges'))
    },
    existsFile(filePath: string): Promise<boolean> {
        return ipcRenderer.invoke('file:exists', filePath)
    },
    basename(filePath: string): Promise<string> {
        return ipcRenderer.invoke('file:basename', filePath)
    },
    async getFileContent(filePath: string): Promise<string> {
        return await unwrapPromise(ipcRenderer.invoke('file:getContent', filePath))
    },
    async saveFile(filePath: string, content: string): Promise<void> {
        return await unwrapPromise(ipcRenderer.invoke('file:save', filePath, content))
    },
    async addMedia(filePath: string, markdownFilePath: string): Promise<string> {
        return await unwrapPromise(ipcRenderer.invoke('file:addMedia', filePath, markdownFilePath))
    },
    showItemInFolder(filePath: string): Promise<void> {
        return ipcRenderer.invoke('file:showItemInFolder', filePath)
    },
} as const

export default files
