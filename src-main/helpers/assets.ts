import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { loadTemplate } from '../presentation/template'

export const PRESENTATION_SCRIPT_FILENAME = 'presentation.js'
export const PREVIEW_SMALL_SCRIPT_FILENAME = 'preview-small.js'
export const PREVIEW_FULLSCREEN_SCRIPT_FILENAME = 'preview-fullscreen.js'
export const BASE_FILE_NAME = 'base.html'

export function resolveAsset(fileName: string): string {
    return resolve(__dirname, 'base', fileName)
}

export function loadAsset(fileName: string): Promise<Buffer> {
    return readFile(resolveAsset(fileName))
}

export async function loadAssetContent(fileName: string): Promise<string> {
    return (await loadAsset(fileName)).toString()
}

export const TEMPLATE_STANDARD = 'standard'

export function isTemplate(possibleTemplate: string): boolean {
    return [TEMPLATE_STANDARD].includes(possibleTemplate)
}

export function getTemplateFolder(template: string): string {
    return resolve(__dirname, 'templates', template)
}

export async function exportStandardTemplate(exportPath: string): Promise<void> {
    const templateFolder = getTemplateFolder(TEMPLATE_STANDARD)
    const template = await loadTemplate(templateFolder)
    template.copyTo(exportPath)
}
