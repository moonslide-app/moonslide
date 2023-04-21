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
} as const

export default files
