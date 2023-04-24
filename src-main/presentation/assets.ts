import { resolve } from 'path'
import { readFile } from 'fs/promises'

export const PREVIEW_SCRIPT_FILENAME = 'preview.js'
export const PRESENTATION_SCRIPT_FILENAME = 'presentation.js'
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
