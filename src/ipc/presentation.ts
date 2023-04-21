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
    async movePresentation(presentationFilePath: string, templateFolderPath: string): Promise<string> {
        return await ipcRenderer.invoke('movePresentation', presentationFilePath, templateFolderPath)
    },
} as const

export default presentation
