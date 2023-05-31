import { ipcRenderer } from 'electron'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { ExportRequest } from '../../src-shared/entities/ExportRequest'
import { Presentation } from '../../src-shared/entities/Presentation'
import { unwrapPromise } from '../../src-shared/errors/wrapPromise'

const presentation = {
    async parsePresentation(request: ParseRequest): Promise<Presentation> {
        return await unwrapPromise(ipcRenderer.invoke('presentation:parse', request))
    },
    async exportPdf(outputPath: string): Promise<string> {
        return await unwrapPromise(ipcRenderer.invoke('export:pdf', outputPath))
    },
    async exportHtml(request: ExportRequest) {
        await unwrapPromise(ipcRenderer.invoke('export:html', request))
    },
    async exportTemplate(outputPath: string): Promise<void> {
        await unwrapPromise(ipcRenderer.invoke('export:template', outputPath))
    },
} as const

export default presentation
