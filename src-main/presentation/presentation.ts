import { resolve } from 'path'
import { writeFile, rm, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { copy } from 'fs-extra'
import { app } from 'electron'
import { loadTemplate } from './template'
import { BuilderConfig, buildHTMLPresentation } from './builder'
import { PRESENTATION_SCRIPT_FILENAME, PREVIEW_SCRIPT_FILENAME, resolveAsset } from './assets'

export const presentationFolderPath = resolve(app.getPath('userData'), 'presentation')

export const presentationTargets = {
    preview: {
        assetScript: PREVIEW_SCRIPT_FILENAME,
        outFileName: 'preview.html',
    },
    presentation: {
        assetScript: PRESENTATION_SCRIPT_FILENAME,
        outFileName: 'presentation.html',
    },
}

export async function clearPresentationFolder(): Promise<void> {
    if (existsSync(presentationFolderPath)) await rm(presentationFolderPath, { recursive: true })
    await mkdir(presentationFolderPath)
}

export async function prepareTemplate(templateFolderPath: string): Promise<void> {
    await clearPresentationFolder()
    const template = await loadTemplate(templateFolderPath)
    await template.copyForPresentation(presentationFolderPath)

    console.log('Prepared template folder.')
}

export async function preparePresentation(presentationContent: string, templateFolderPath: string): Promise<void> {
    const template = await loadTemplate(templateFolderPath)
    const config = template.getConfig()
    const slidesTemplate = await template.loadSlides()

    const baseConfig: BuilderConfig = {
        slideContent: slidesTemplate.buildSlides(presentationContent),
        styleSheetPaths: config.stylesheets,
        meta: config.meta,
    }

    for (const target of Object.values(presentationTargets)) {
        const targetConfig: BuilderConfig = {
            ...baseConfig,
            scriptPaths: [...config.plugins, `./${target.assetScript}`, config.entry],
        }

        const htmlPresentation = await buildHTMLPresentation(targetConfig)
        await writeFile(resolve(presentationFolderPath, target.outFileName), htmlPresentation)
        await copy(resolveAsset(target.assetScript), resolve(presentationFolderPath, target.assetScript))
    }

    console.log('Generated new presentation files.')
}
