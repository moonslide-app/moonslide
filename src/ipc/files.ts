import { ipcRenderer } from 'electron'
import { z } from 'zod'

const files = {
    selectFile: async () => {
        const result = await ipcRenderer.invoke('dialog:selectFile')
        return z.string().optional().parse(result)
    },
    selectFolder: async () => {
        const result = await ipcRenderer.invoke('dialog:selectFolder')
        return z.string().optional().parse(result)
    },
    selectOutputFolder: async () => {
        const result = await ipcRenderer.invoke('dialog:selectOutputFolder')
        return z.string().optional().parse(result)
    },
    selectOutputFile: async (filter: { name: string; extension: string }) => {
        const result = await ipcRenderer.invoke('dialog:selectOutputFile', filter)
        return z.string().optional().parse(result)
    },
    getFileContent: async (filePath: string) => {
        const result = await ipcRenderer.invoke('file:getContent', filePath)
        return z.string().optional().parse(result)
    },
    saveFile: async (filePath: string, content: string) => {
        await ipcRenderer.invoke('file:save', filePath, content)
    },
    exportPdf: async (outputPath: string) => {
        await ipcRenderer.invoke('export:pdf', outputPath)
    },
} as const

export default files
