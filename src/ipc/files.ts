import { ipcRenderer } from 'electron'
import { unwrapPromise } from '../../src-shared/errors/wrapPromise'

const files = {
    selectFile(title: string, filters?: Electron.FileFilter[]): Promise<string> {
        return ipcRenderer.invoke('dialog:selectFile', title, filters)
    },
    selectFolder(title: string): Promise<string> {
        return ipcRenderer.invoke('dialog:selectFolder', title)
    },
    selectOutputFile(title: string, filters?: Electron.FileFilter[]): Promise<string> {
        return ipcRenderer.invoke('dialog:selectOutputFile', title, filters)
    },
    selectOutputFolder(title: string): Promise<string> {
        return ipcRenderer.invoke('dialog:selectOutputFolder', title)
    },
    showSaveChangesDialog(): Promise<boolean> {
        return ipcRenderer.invoke('dialog:saveChanges')
    },
    existsFile(filePath: string): Promise<boolean> {
        return ipcRenderer.invoke('file:exists', filePath)
    },
    async getFileContent(filePath: string): Promise<string> {
        return await unwrapPromise(ipcRenderer.invoke('file:getContent', filePath))
    },
    async saveFile(filePath: string, content: string): Promise<void> {
        return await unwrapPromise(ipcRenderer.invoke('file:save', filePath, content))
    },
} as const

export default files
