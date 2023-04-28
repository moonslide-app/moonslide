import { resolve } from 'path'
import { writeFile, cp, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { loadTemplate } from '../presentation/template'
import { HTMLPresentation, buildHTMLPresentation } from '../presentation/htmlBuilder'
import { BASE_FILE_NAME, loadAssetContent, resolveAsset } from '../helpers/assets'
import { presentationTargets } from '../presentation/presentation'
import pretty from 'pretty'
import { ExportRequest } from '../../src-shared/entities/ExportRequest'
import { parse } from '../presentation/parser'
import { prepareMedia } from '../presentation/media'

export async function exportHtml(request: ExportRequest): Promise<void> {
    const presentation = await parse({ ...request, imageMode: request.mode })
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)

    const templateConfig =
        request.mode === 'export-standalone' ? template.getConfig() : template.getConfig(request.outputPath)

    const target = presentationTargets.presentation

    const presentationConfig: HTMLPresentation = {
        presentationContent: presentation.html,
        styleSheetPaths: templateConfig.stylesheets,
        scriptPaths: [
            templateConfig.reveal,
            ...(templateConfig.plugins ?? []),
            `./${target.assetScript}`,
            templateConfig.entry,
        ],
        meta: {
            title: presentation.config.title,
            author: presentation.config.author,
        },
    }

    const baseFile = await loadAssetContent(BASE_FILE_NAME)
    const htmlPresentation = buildHTMLPresentation(baseFile, presentationConfig)
    const formatted = pretty(htmlPresentation, { ocd: true })

    if (!existsSync(request.outputPath)) await mkdir(request.outputPath)

    if (request.mode === 'export-standalone') {
        await template.copyTo(request.outputPath)
        await prepareMedia(request.outputPath, presentation.images)
    }

    await writeFile(resolve(request.outputPath, target.outFileName), formatted)
    await cp(resolveAsset(target.assetScript), resolve(request.outputPath, target.assetScript))
}
