import { resolve } from 'path'
import { writeFile, rm, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { copy } from 'fs-extra'
import { app } from 'electron'
import { loadTemplate } from './template'
import { HTMLPresentation, buildHTMLPresentation } from './htmlBuilder'
import {
    BASE_FILE_NAME,
    PRESENTATION_SCRIPT_FILENAME,
    PREVIEW_SCRIPT_FILENAME,
    loadAssetContent,
    resolveAsset,
} from './assets'
import { Presentation } from '../../src-shared/entities/Presentation'
import pretty from 'pretty'

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
    console.log('Cleared presentation folder.')
}

export async function prepareTemplate(templateFolderPath: string): Promise<void> {
    await clearPresentationFolder()
    const template = await loadTemplate(templateFolderPath)
    await template.copyForPresentation(presentationFolderPath)
    console.log('Prepared template folder.')
}

export async function exportPresentation(presentation: Presentation, outputPath: string): Promise<void> {
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)
    const templateConfig = template.getConfig()
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

    await template.copyForPresentation(outputPath)
    await writeFile(resolve(outputPath, target.outFileName), formatted)
    await copy(resolveAsset(target.assetScript), resolve(outputPath, target.assetScript))

    console.log('Exported presentation.')
}

export async function exportOnlyPresentation(presentation: Presentation, outputPath: string): Promise<void> {
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)
    const templateConfig = template.getConfigWithRelativePaths(outputPath)
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

    // await template.copyForPresentation(outputPath)
    await mkdir(outputPath)
    await writeFile(resolve(outputPath, target.outFileName), formatted)
    await copy(resolveAsset(target.assetScript), resolve(outputPath, target.assetScript))

    console.log('Exported presentation.')
}

export async function preparePresentation(presentation: Presentation): Promise<void> {
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)
    const config = template.getConfig()

    const baseConfig: HTMLPresentation = {
        presentationContent: presentation.html,
        styleSheetPaths: config.stylesheets,
        meta: {
            title: presentation.config.title,
            author: presentation.config.author,
        },
    }

    const baseFile = await loadAssetContent(BASE_FILE_NAME)
    for (const target of Object.values(presentationTargets)) {
        const targetConfig: HTMLPresentation = {
            ...baseConfig,
            scriptPaths: [config.reveal, ...(config.plugins ?? []), `./${target.assetScript}`, config.entry],
        }
        const htmlPresentation = buildHTMLPresentation(baseFile, targetConfig)
        await writeFile(resolve(presentationFolderPath, target.outFileName), htmlPresentation)

        await copy(resolveAsset(target.assetScript), resolve(presentationFolderPath, target.assetScript))
    }

    console.log('Generated new presentation files.')
}
