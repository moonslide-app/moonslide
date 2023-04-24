import { resolve } from 'path'
import { writeFile } from 'fs/promises'
import { copy } from 'fs-extra'
import { app } from 'electron'

import { loadTemplate } from './template'
import { BuilderConfig, buildHTMLPresentation } from './builder'
import { PRESENTATION_SCRIPT_FILENAME, PREVIEW_SCRIPT_FILENAME, resolveAsset } from './assets'

export async function preparePresentation(presentationContent: string, templateFolderPath: string): Promise<void> {
    const template = await loadTemplate(templateFolderPath)
    const config = template.getConfig()
    const slidesTemplate = await template.loadSlides()

    const builderConfig: BuilderConfig = {
        slideContent: slidesTemplate.buildSlides(presentationContent),
        styleSheetPaths: config.stylesheets,
        meta: config.meta,
    }

    const targets = [
        {
            assetScript: PREVIEW_SCRIPT_FILENAME,
            outFileName: 'preview.html',
        },
        {
            assetScript: PRESENTATION_SCRIPT_FILENAME,
            outFileName: 'presentation.html',
        },
    ]

    const presentationOutputPath = resolve(app.getPath('userData'), 'presentation')
    await template.copyForPresentation(presentationOutputPath)

    for (const target of targets) {
        const targetConfig: BuilderConfig = {
            ...builderConfig,
            scriptPaths: [...config.plugins, `./${target.assetScript}`, config.entry],
        }

        const htmlPresentation = await buildHTMLPresentation(targetConfig)
        await writeFile(resolve(presentationOutputPath, target.outFileName), htmlPresentation)
        await copy(resolveAsset(target.assetScript), resolve(presentationOutputPath, target.assetScript))
    }
}
