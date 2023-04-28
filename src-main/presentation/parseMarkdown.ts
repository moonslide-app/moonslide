import MarkdownIt from 'markdown-it'
import MarkdownItAttrs from 'markdown-it-attrs'
import MarkdownItReplaceLink from 'markdown-it-replace-link'
import sanitizeHtml from './sanitize'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { isAbsolute, resolve, dirname, extname, relative } from 'path'
import { parse } from 'url'
import { getLocalImageUrl } from '../helpers/protocol'
import { MEDIA_FOLDER_NAME } from './media'

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
     * - For mode `export-relative` this path will be the same as `originalPath`.
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

export type ParseMarkdownResult = {
    html: string
    localImages: LocalImage[]
}

export function parseMarkdown(request: ParseRequest): ParseMarkdownResult {
    const localImages: LocalImage[] = []

    function replaceLink(link: string): string {
        const parsedUrl = parse(link)
        // Leave all links with a protocol as they are
        if (parsedUrl.protocol || !parsedUrl.path) return link
        const originalPath = parsedUrl.path
        const resolvedPath = isAbsolute(originalPath)
            ? originalPath
            : resolve(dirname(request.markdownFilePath), originalPath)

        let transformedPath = ''
        let requiredCopyAction: RequiredCopyAction | undefined = undefined
        if (request.imageMode === 'preview') {
            transformedPath = getLocalImageUrl(resolvedPath)
        } else if (request.imageMode === 'export-standalone') {
            transformedPath = `./${MEDIA_FOLDER_NAME}/${simpleHash(resolvedPath)}${extname(resolvedPath)}`
            requiredCopyAction = {
                fromResolvedPath: resolvedPath,
                toRelativePath: transformedPath,
            }
        } else if (request.imageMode === 'export-relative') {
            if (!request.outputPath)
                throw new Error(`Can not parse markdown in mode 'export-relative' when no outputPath is specified.`)
            if (isAbsolute(originalPath)) transformedPath = originalPath
            else transformedPath = relative(request.outputPath, resolvedPath)
        }

        localImages.push({ originalPath, resolvedPath, transformedPath, requiredCopyAction })
        return transformedPath
    }

    const markdownItOptions = { replaceLink } as MarkdownIt.Options
    const markdownIt = new MarkdownIt(markdownItOptions).use(MarkdownItAttrs).use(MarkdownItReplaceLink)
    const parsed = markdownIt.render(request.markdownContent)
    const sanitized = sanitizeHtml(parsed)
    return { html: sanitized, localImages }
}

const simpleHash = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash &= hash // Convert to 32bit integer
    }
    return new Uint32Array([hash])[0].toString(36)
}
