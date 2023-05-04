import { resolve, dirname, basename } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { loadTemplate } from '../presentation/template'
import { buildHTMLPresentation } from '../presentation/htmlBuilder'
import pretty from 'pretty'
import { ExportRequest } from '../../src-shared/entities/ExportRequest'
import { parse } from '../parse'
import { prepareMedia } from '../presentation/media'

export async function exportHtml(request: ExportRequest): Promise<void> {
    const isStandalone = request.mode === 'export-standalone'

    const outputFolderPath = isStandalone ? request.outputPath : dirname(request.outputPath)
    const outputFileName = isStandalone ? 'presentation.html' : basename(request.outputPath)

    const presentation = await parse({ ...request, imageMode: request.mode, outputFolderPath })
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)

    const templateConfig = isStandalone ? template.getConfig() : template.getConfig(outputFolderPath)

    const htmlPresentation = await buildHTMLPresentation({ presentation, templateConfig, type: 'presentation' })
    const formatted = pretty(htmlPresentation, { ocd: true })

    if (!existsSync(outputFolderPath)) await mkdir(outputFolderPath)

    if (isStandalone) {
        await template.copyTo(request.outputPath)
        await prepareMedia(request.outputPath, presentation.images)
    }

    await writeFile(resolve(outputFolderPath, outputFileName), formatted)
}
