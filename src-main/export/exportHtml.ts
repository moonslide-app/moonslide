import { resolve } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { loadTemplate } from '../presentation/template'
import { buildHTMLPresentation } from '../presentation/htmlBuilder'
import pretty from 'pretty'
import { ExportRequest } from '../../src-shared/entities/ExportRequest'
import { parse } from '../presentation/parser'
import { prepareMedia } from '../presentation/media'

export async function exportHtml(request: ExportRequest): Promise<void> {
    const presentation = await parse({ ...request, imageMode: request.mode })
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)

    const templateConfig =
        request.mode === 'export-standalone' ? template.getConfig() : template.getConfig(request.outputPath)

    const htmlPresentation = await buildHTMLPresentation({ presentation, templateConfig, type: 'presentation' })
    const formatted = pretty(htmlPresentation, { ocd: true })

    if (!existsSync(request.outputPath)) await mkdir(request.outputPath)

    if (request.mode === 'export-standalone') {
        await template.copyTo(request.outputPath)
        await prepareMedia(request.outputPath, presentation.images)
    }

    await writeFile(resolve(request.outputPath, 'presentation.html'), formatted)
}
