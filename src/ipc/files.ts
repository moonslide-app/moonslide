import { ipcRenderer } from 'electron'
import { z } from 'zod'

const files = {
    selectMarkdownFile: async () => {
        const result = await ipcRenderer.invoke('dialog:selectMarkdownFile')
        return z.string().optional().parse(result)
    },
} as const

export default files
