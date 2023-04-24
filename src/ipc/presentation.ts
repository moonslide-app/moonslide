import { ipcRenderer } from 'electron'
import { ParsedPresentation } from '../../src-shared/entities/ParsedPresentation'

const presentation = {
    async clearOutputFolder(): Promise<void> {
        await ipcRenderer.invoke('presentation:clearOutFolder')
    },
    async prepateTemplate(templateFolderPath: string): Promise<void> {
        await ipcRenderer.invoke('presentation:prepareTemplate', templateFolderPath)
    },
    async preparePresentation(presentation: ParsedPresentation, filePath: string): Promise<void> {
        await ipcRenderer.invoke('presentation:prepare', presentation, filePath)
    },
} as const

export default presentation
