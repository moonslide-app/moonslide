import { existsSync } from 'fs'
import { LocalImage } from '../parse/imagePath'
import { mkdir, cp } from 'fs/promises'
import { resolve, basename, dirname, relative, isAbsolute, extname } from 'path'
import { relativeWithForwardSlash } from '../helpers/pathNormalizer'

export const MEDIA_FOLDER_NAME = 'media'
export const USER_MEDIA_FOLDER_NAME = 'media'

export async function prepareMedia(exportFolder: string, images: LocalImage[]): Promise<void> {
    const mediaFolder = resolve(exportFolder, MEDIA_FOLDER_NAME)

    if (!existsSync(mediaFolder)) {
        await mkdir(mediaFolder, {})
    }

    for (const image of images) {
        const copyAction = image.requiredCopyAction
        if (copyAction) {
            const toResolvedPath = resolve(exportFolder, copyAction.toRelativePath)
            try {
                await cp(copyAction.fromResolvedPath, toResolvedPath)
            } catch (error) {
                console.warn(`Ignoring error while copying media files: ${error}`)
            }
        }
    }
}

function isInsideDirectory(parent: string, child: string): boolean {
    const relativePath = relative(parent, child)
    return !!relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)
}

export async function addMedia(filePath: string, markdownFilePath: string): Promise<string> {
    const markdownDirectory = dirname(markdownFilePath)
    function getRelativePathFromMarkdownDir(path: string) {
        const relativePath = relativeWithForwardSlash(markdownDirectory, path)
        if (relativePath.startsWith('.')) return relativePath
        else return './' + relativePath
    }

    const isInside = isInsideDirectory(markdownDirectory, filePath)
    if (isInside) return getRelativePathFromMarkdownDir(filePath)

    const mediaDirectoryPath = resolve(markdownDirectory, USER_MEDIA_FOLDER_NAME)
    if (!existsSync(mediaDirectoryPath)) mkdir(mediaDirectoryPath)

    let number = 0
    let saved = false
    let fileTargetPath = ''
    while (!saved) {
        const ext = extname(filePath)
        const base = basename(filePath)
        const file = base.slice(0, base.length - ext.length)
        const fileName = `${file}${number ? `-${number}` : ''}${ext}`
        fileTargetPath = resolve(mediaDirectoryPath, fileName)
        if (!existsSync(fileTargetPath)) {
            await cp(filePath, fileTargetPath, {})
            saved = true
        } else number++
    }

    return getRelativePathFromMarkdownDir(fileTargetPath)
}
