import { ipcRenderer } from 'electron'

const files = {
    selectFile(filters?: Electron.FileFilter[]): Promise<string> {
        return ipcRenderer.invoke('dialog:selectFile', filters)
    },
    selectFolder(): Promise<string> {
        return ipcRenderer.invoke('dialog:selectFolder')
    },
    selectOutputFile(filters?: Electron.FileFilter[]): Promise<string> {
        return ipcRenderer.invoke('dialog:selectOutputFile', filters)
    },
    selectOutputFolder(): Promise<string> {
        return ipcRenderer.invoke('dialog:selectOutputFolder')
    },
    showSaveChangesDialog(): Promise<boolean> {
        return ipcRenderer.invoke('dialog:saveChanges')
    },
    async getFileContent(filePath: string): Promise<string | undefined> {
        return await ipcRenderer.invoke('file:getContent', filePath)
    },
    async saveFile(filePath: string, content: string): Promise<void> {
        await ipcRenderer.invoke('file:save', filePath, content)
    },
} as const

export default files
