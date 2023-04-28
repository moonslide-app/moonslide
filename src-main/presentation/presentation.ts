import { resolve } from 'path'
import { writeFile, rm, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { loadTemplate } from './template'
import { buildHTMLPresentation } from './htmlBuilder'
import { Presentation } from '../../src-shared/entities/Presentation'
import { presentationFolderPath, presentationTargets } from '../helpers/protocol'

export async function clearPresentationFolder(): Promise<void> {
    if (existsSync(presentationFolderPath)) await rm(presentationFolderPath, { recursive: true })
    await mkdir(presentationFolderPath)
    console.log('Cleared presentation folder.')
}

export async function prepareTemplate(templateFolderPath: string): Promise<void> {
    await clearPresentationFolder()
    const template = await loadTemplate(templateFolderPath)
    await template.copyTo(presentationFolderPath)
    console.log('Prepared template folder.')
}

export async function preparePresentation(presentation: Presentation): Promise<void> {
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)
    const templateConfig = template.getConfig()

    const targets = [
        {
            name: 'presentation',
            file: presentationTargets.presentation,
        },
        {
            name: 'preview',
            file: presentationTargets.preview,
        },
    ] as const

    for (const target of Object.values(targets)) {
        const htmlPresentation = await buildHTMLPresentation({ presentation, templateConfig, type: target.name })
        await writeFile(resolve(presentationFolderPath, target.file), htmlPresentation)
    }

    console.log('Generated new presentation files.')
}
