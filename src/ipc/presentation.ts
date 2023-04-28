import { ipcRenderer } from 'electron'
import { Presentation } from '../../src-shared/entities/Presentation'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { ExportRequest } from '../../src-shared/entities/ExportRequest'

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
    async exportPdf(outputPath: string): Promise<string> {
        return await ipcRenderer.invoke('export:pdf', outputPath)
    },
    async exportHtml(request: ExportRequest) {
        await ipcRenderer.invoke('export:html', request)
    },
} as const

export default presentation
