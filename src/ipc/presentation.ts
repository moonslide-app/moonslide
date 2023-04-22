import { ipcRenderer } from 'electron'

const presentation = {
    async preparePresentation(presentationFilePath: string, templateFolderPath: string): Promise<string> {
        return await ipcRenderer.invoke('presentation:prepare', presentationFilePath, templateFolderPath)
    },
} as const

export default presentation
