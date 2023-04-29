import { resolve } from 'path'
import { writeFile, rm, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { loadTemplate } from './template'
import { buildHTMLPresentation } from './htmlBuilder'
import { Presentation } from '../../src-shared/entities/Presentation'
import { previewFolderPath, previewTargets } from '../helpers/protocol'
import { BrowserWindow } from 'electron'

export async function clearPreviewFolder(): Promise<void> {
    if (existsSync(previewFolderPath)) await rm(previewFolderPath, { recursive: true })
    await mkdir(previewFolderPath)
    console.log('Cleared presentation folder.')
}

export async function prepareTemplateForPreview(templateFolderPath: string): Promise<void> {
    await clearPreviewFolder()
    const template = await loadTemplate(templateFolderPath)
    await template.copyTo(previewFolderPath)
    console.log('Prepared template folder.')
}

export async function preparePresentationForPreview(presentation: Presentation): Promise<void> {
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)
    const templateConfig = template.getConfig()

    const targets = [
        {
            name: 'preview-fullscreen',
            file: previewTargets.fullscreen,
        },
        {
            name: 'preview-small',
            file: previewTargets.small,
        },
    ] as const

    for (const target of Object.values(targets)) {
        const htmlPresentation = await buildHTMLPresentation({ presentation, templateConfig, type: target.name })
        await writeFile(resolve(previewFolderPath, target.file), htmlPresentation)
    }

    console.log('Generated new presentation files.')
}

let currentPreviewWindow: BrowserWindow | undefined = undefined
export function openPreviewWindow() {
    if (currentPreviewWindow) currentPreviewWindow.destroy()

    const previewWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            webSecurity: false,
        },
    })

    previewWindow.loadURL('reveal://presentation/')
    currentPreviewWindow = previewWindow
}

export function reloadPreviewWindow() {
    currentPreviewWindow?.webContents.reload()
}
