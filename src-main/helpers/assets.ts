import { resolve } from 'path'
import { readFile } from 'fs/promises'

export const PRESENTATION_SCRIPT_FILENAME = 'presentation.js'
export const PREVIEW_SMALL_SCRIPT_FILENAME = 'preview-small.js'
export const PREVIEW_FULLSCREEN_SCRIPT_FILENAME = 'preview-fullscreen.js'
export const BASE_FILE_NAME = 'base.html'

export function resolveAsset(fileName: string): string {
    return resolve(__dirname, fileName)
}

export function loadAsset(fileName: string): Promise<Buffer> {
    return readFile(resolveAsset(fileName))
}

export async function loadAssetContent(fileName: string): Promise<string> {
    return (await loadAsset(fileName)).toString()
}

export const TEMPLATE_BASIC = 'basic'
export const TEMPLATE_FANCY = 'fancy'

export function isTemplate(possibleTemplate: string): boolean {
    return [TEMPLATE_BASIC, TEMPLATE_FANCY].includes(possibleTemplate)
}

export function getTemplateFolder(template: string): string {
    return resolve(__dirname, 'templates', template)
}
