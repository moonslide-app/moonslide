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
        const result = await ipcRenderer.invoke('dialog:selectOuputFolder')
        return z.string().optional().parse(result)
    },
    getFileContent: async (filePath: string) => {
        const result = await ipcRenderer.invoke('file:getContent', filePath)
        return z.string().optional().parse(result)
    },
    saveFile: async (filePath: string, content: string) => {
        await ipcRenderer.invoke('file:save', filePath, content)
    },
} as const

export default files
