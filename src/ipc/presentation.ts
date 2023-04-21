import { ipcRenderer } from 'electron'

const presentation = {
    async exportPresentation(
        presentationFilePath: string,
        templateFolderPath: string,
        outputFolderPath: string
    ): Promise<string> {
        return await ipcRenderer.invoke(
            'exportPresentation',
            presentationFilePath,
            templateFolderPath,
            outputFolderPath
        )
    },
    async preparePresentation(presentationFilePath: string, templateFolderPath: string): Promise<string> {
        return await ipcRenderer.invoke('preparePresentation', presentationFilePath, templateFolderPath)
    },
} as const

export default presentation
