import { existsSync } from 'fs'
import { LocalImage } from '../parse/imagePath'
import { mkdir, cp } from 'fs/promises'
import { resolve } from 'path'

export const MEDIA_FOLDER_NAME = 'media'

export async function prepareMedia(exportFolder: string, images: LocalImage[]): Promise<void> {
    const mediaFolder = resolve(exportFolder, MEDIA_FOLDER_NAME)

    if (!existsSync(mediaFolder)) {
        await mkdir(mediaFolder, {})
    }

    for (const image of images) {
        const copyAction = image.requiredCopyAction
        if (copyAction) {
            const toResolvedPath = resolve(exportFolder, copyAction.toRelativePath)
            await cp(copyAction.fromResolvedPath, toResolvedPath)
        }
    }
}
