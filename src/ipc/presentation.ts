import { ipcRenderer } from 'electron'

const presentation = {
    async preparePresentation(presentationContent: string, templateFolderPath: string): Promise<string> {
        return await ipcRenderer.invoke('presentation:prepare', presentationContent, templateFolderPath)
    },
} as const

export default presentation
