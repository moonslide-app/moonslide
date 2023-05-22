import { resolve } from 'path'
import { writeFile, rm, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { loadTemplate } from './template'
import { buildHTMLPresentation } from './htmlBuilder'
import { Presentation } from '../../src-shared/entities/Presentation'
import { previewFolderPath, previewTargets } from '../helpers/protocol'
import { BrowserWindow } from 'electron'
import pretty from 'pretty'

export async function clearPreviewFolder(): Promise<void> {
    if (existsSync(previewFolderPath)) await rm(previewFolderPath, { recursive: true })
    await mkdir(previewFolderPath)
    console.log('Cleared presentation folder.')
}

export async function preparePresentationForPreview(presentation: Presentation): Promise<void> {
    const template = await loadTemplate(presentation.resolvedPaths.templateFolder)
    const templateConfig = template.getConfigLocalFile()

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
        const htmlPresentation = await buildHTMLPresentation({
            contentHtml: presentation.contentHtml,
            presentationConfig: presentation.config,
            templateConfig,
            type: target.name,
        })
        const prettified = pretty(htmlPresentation)
        await writeFile(resolve(previewFolderPath, target.file), prettified)
    }

    console.log('Generated new presentation files.')
}

let currentPreviewWindow: BrowserWindow | undefined = undefined
export function openPreviewWindow() {
    if (currentPreviewWindow) currentPreviewWindow.destroy()

    const previewWindow = new BrowserWindow({
        width: 1280,
        height: 800,
    })

    previewWindow.loadURL('reveal://preview-fullscreen/')
    currentPreviewWindow = previewWindow
}

export function reloadPreviewWindow() {
    if (currentPreviewWindow && !currentPreviewWindow.isDestroyed()) {
        currentPreviewWindow?.webContents.reload()
    }
}
