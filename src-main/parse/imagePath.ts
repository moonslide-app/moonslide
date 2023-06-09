import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { isAbsolute, resolve, dirname, extname, basename } from 'path'
import { parse } from 'url'
import { getLocalFileUrl } from '../helpers/protocol'
import { MEDIA_FOLDER_NAME } from '../presentation/media'
import { relativeWithForwardSlash } from '../helpers/pathNormalizer'
import { replaceBackwardSlash } from '../../src-shared/helpers/pathNormalizer'

export type LocalImage = {
    /**
     * The unchanged original path, which was in markdown
     */
    originalPath: string
    /**
     * The resolved absolute path of the image on the system
     */
    resolvedPath: string
    /**
     * The path which is used in the parsed HTML. It can be one of three things:
     * - For mode `preview` it is an url with a custom scheme which points to the `resolvedPath`
     * - For mode `export-standalone` the `resolvedPath` is transformed to a relative path
     * pointing to the media directory. In this case the `requiredCopyAction` will be set
     * - For mode `export-relative` the relative paths will be updated so they
     * work from the location the presentation is exported to.
     */
    transformedPath: string
    /**
     * This will only be set in mode `export-standalone`. It contains the info,
     * where the image is located in the filesystem and where the parsed presentation
     * expects the file to be relative to it.
     */
    requiredCopyAction?: RequiredCopyAction
}

export type RequiredCopyAction = {
    fromResolvedPath: string
    toRelativePath: string
}

export function isLikelyPath(maybePath: unknown): maybePath is string {
    if (typeof maybePath !== 'string') return false
    return basename(maybePath) !== maybePath
}

export function transformImagePath(path: string, request: ParseRequest): LocalImage | undefined {
    const parsedUrl = parse(path)
    // Leave all links with a protocol as they are
    if (parsedUrl.protocol || !parsedUrl.path) return undefined

    const originalPath = parsedUrl.path
    const resolvedPath = isAbsolute(originalPath)
        ? originalPath
        : resolve(dirname(request.markdownFilePath), originalPath)

    let transformedPath = ''
    let requiredCopyAction: RequiredCopyAction | undefined = undefined
    if (request.imageMode === 'preview') {
        transformedPath = getLocalFileUrl(replaceBackwardSlash(resolvedPath), false)
    } else if (request.imageMode === 'export-standalone') {
        transformedPath = `./${MEDIA_FOLDER_NAME}/${simpleHash(resolvedPath)}${extname(resolvedPath)}`
        requiredCopyAction = {
            fromResolvedPath: resolvedPath,
            toRelativePath: transformedPath,
        }
    } else if (request.imageMode === 'export-relative') {
        if (!request.outputFolderPath)
            throw new Error(`Can not parse markdown in mode 'export-relative' when no outputFolderPath is specified.`)
        if (isAbsolute(originalPath)) transformedPath = replaceBackwardSlash(resolvedPath)
        else transformedPath = relativeWithForwardSlash(request.outputFolderPath, resolvedPath)
    }

    return { originalPath, resolvedPath, transformedPath, requiredCopyAction }
}

function simpleHash(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash &= hash // Convert to 32bit integer
    }
    return new Uint32Array([hash])[0].toString(36)
}
