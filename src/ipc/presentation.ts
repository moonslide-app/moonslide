import { ipcRenderer } from 'electron'
import { Presentation } from '../../src-shared/entities/Presentation'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'

const presentation = {
    async clearOutputFolder(): Promise<void> {
        await ipcRenderer.invoke('presentation:clearOutFolder')
    },
    async parsePresentation(request: ParseRequest): Promise<Presentation> {
        return await ipcRenderer.invoke('presentation:parse', request)
    },
    async prepareTemplate(templateFolderPath: string): Promise<void> {
        await ipcRenderer.invoke('presentation:prepareTemplate', templateFolderPath)
    },
    async preparePresentation(presentation: Presentation): Promise<void> {
        await ipcRenderer.invoke('presentation:prepare', presentation)
    },
    async exportPresentation(presentation: Presentation, outputPath: string) {
        await ipcRenderer.invoke('presentation:export', presentation, outputPath)
    },
} as const

export default presentation
