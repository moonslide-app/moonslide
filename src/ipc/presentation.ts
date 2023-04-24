import { ipcRenderer } from 'electron'

const presentation = {
    async clearOutputFolder(): Promise<void> {
        return await ipcRenderer.invoke('presentation:clearOutFolder')
    },
    async prepateTemplate(templateFolderPath: string): Promise<void> {
        return await ipcRenderer.invoke('presentation:prepareTemplate', templateFolderPath)
    },
    async preparePresentation(presentationContent: string, templateFolderPath: string): Promise<string> {
        return await ipcRenderer.invoke('presentation:prepare', presentationContent, templateFolderPath)
    },
} as const

export default presentation
