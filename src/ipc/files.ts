import { ipcRenderer } from 'electron'

const files = {
    async selectFile(): Promise<string | undefined> {
        return await ipcRenderer.invoke('dialog:selectFile')
    },
    async selectFolder(): Promise<string | undefined> {
        return await ipcRenderer.invoke('dialog:selectFolder')
    },
    async selectOutputFolder(): Promise<string | undefined> {
        return await ipcRenderer.invoke('dialog:selectOutputFolder')
    },
    async selectOutputFile(filter: { name: string; extension: string }): Promise<string | undefined> {
        return await ipcRenderer.invoke('dialog:selectOutputFile', filter)
    },
    async getFileContent(filePath: string): Promise<string | undefined> {
        return await ipcRenderer.invoke('file:getContent', filePath)
    },
    async saveFile(filePath: string, content: string): Promise<void> {
        await ipcRenderer.invoke('file:save', filePath, content)
    },
    async exportPdf(outputPath: string): Promise<string> {
        return await ipcRenderer.invoke('export:pdf', outputPath)
    },
} as const

export default files
