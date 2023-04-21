import { ipcRenderer } from 'electron'

const presentation = {
    async exportPresentation(
        presentationFilePath: string,
        templateFolderPath: string,
        outputFolderPath: string
    ): Promise<void> {
        return await ipcRenderer.invoke(
            'save:exportPresentation',
            presentationFilePath,
            templateFolderPath,
            outputFolderPath
        )
    },
} as const

export default presentation
