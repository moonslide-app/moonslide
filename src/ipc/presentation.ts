import { ipcRenderer } from 'electron'
import { Presentation } from '../../src-shared/entities/Presentation'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { ExportRequest } from '../../src-shared/entities/ExportRequest'

const presentation = {
    async parsePresentation(request: ParseRequest): Promise<Presentation> {
        return await ipcRenderer.invoke('presentation:parse', request)
    },
    async clearPreviewFolder(): Promise<void> {
        await ipcRenderer.invoke('preview:clearOutFolder')
    },
    async preparePresentationForPreview(presentation: Presentation): Promise<void> {
        await ipcRenderer.invoke('preview:prepare', presentation)
    },
    async openPreviewWindow() {
        await ipcRenderer.invoke('preview:show')
    },
    async reloadPreviewWindow() {
        await ipcRenderer.invoke('preview:reload')
    },
    async exportPdf(outputPath: string): Promise<string> {
        return await ipcRenderer.invoke('export:pdf', outputPath)
    },
    async exportHtml(request: ExportRequest) {
        await ipcRenderer.invoke('export:html', request)
    },
} as const

export default presentation
