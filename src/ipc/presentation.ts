import { ipcRenderer } from 'electron'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { ExportRequest } from '../../src-shared/entities/ExportRequest'
import { Presentation } from '../../src-shared/entities/Presentation'

const presentation = {
    async parsePresentation(request: ParseRequest): Promise<Presentation> {
        return await ipcRenderer.invoke('presentation:parse', request)
    },
    async exportPdf(outputPath: string): Promise<string> {
        return await ipcRenderer.invoke('export:pdf', outputPath)
    },
    async exportHtml(request: ExportRequest) {
        await ipcRenderer.invoke('export:html', request)
    },
} as const

export default presentation
