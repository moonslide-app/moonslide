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

    const parsedPresentation = await parse({ ...request, imageMode: request.mode, outputFolderPath })

    const template = await loadTemplate(parsedPresentation.resolvedPaths.templateFolder)

    const templateConfig = isStandalone ? template.getConfig() : template.getConfig(outputFolderPath)

    const htmlPresentation = await buildHTMLPresentation({
        contentHtml: parsedPresentation.contentHtml,
        presentationConfig: parsedPresentation.config,
        templateConfig,
        type: 'export',
    })
    const formatted = pretty(htmlPresentation, { ocd: true })

    if (!existsSync(outputFolderPath)) await mkdir(outputFolderPath)

    if (isStandalone) {
        await template.copyTo(request.outputPath)
        await prepareMedia(request.outputPath, parsedPresentation.images)
    }

    await writeFile(resolve(outputFolderPath, outputFileName), formatted)
}
