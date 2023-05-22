import { ipcRenderer } from 'electron'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { ExportRequest } from '../../src-shared/entities/ExportRequest'
import type { PresentationStore } from '../../src-shared/entities/PresentationStore'

const presentation = {
    async parsePresentation(request: ParseRequest): Promise<PresentationStore> {
        return await ipcRenderer.invoke('presentation:parse', request)
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
