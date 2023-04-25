import { ipcRenderer } from 'electron'

const files = {
    async selectFile(): Promise<string | undefined> {
        return await ipcRenderer.invoke('dialog:selectFile')
    },
    async selectFolder(): Promise<string | undefined> {
        return await ipcRenderer.invoke('dialog:selectFolder')
    },
    async selectOutputFolder(): Promise<string | undefined> {
        return await ipcRenderer.invoke('dialog:selectOuputFolder')
    },
    async getFileContent(filePath: string): Promise<string | undefined> {
        return await ipcRenderer.invoke('file:getContent', filePath)
    },
    async saveFile(filePath: string, content: string): Promise<void> {
        await ipcRenderer.invoke('file:save', filePath, content)
    },
} as const

export default files
