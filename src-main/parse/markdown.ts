import MarkdownIt from 'markdown-it'
import MarkdownItAttrs from 'markdown-it-attrs'
import MarkdownItBracketedSpans from 'markdown-it-bracketed-spans'
import MarkdownItReplaceLink from 'markdown-it-replace-link'
import sanitizeHtml from '../presentation/sanitize'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { LocalImage, transformImagePath } from './imagePath'

export type ParseMarkdownResult = {
    html: string
    localImages: LocalImage[]
}

export function parseMarkdown(request: ParseRequest): ParseMarkdownResult {
    const localImages: LocalImage[] = []

    function replaceLink(link: string): string {
        const image = transformImagePath(link, request)
        if (image) localImages.push(image)
        return image?.transformedPath ?? link
    }

    const markdownItOptions = { replaceLink } as MarkdownIt.Options

    const markdownIt = new MarkdownIt(markdownItOptions)
        .use(MarkdownItAttrs)
        .use(MarkdownItBracketedSpans)
        .use(MarkdownItReplaceLink)

    const parsed = markdownIt.render(request.markdownContent)
    const sanitized = sanitizeHtml(parsed)
    return { html: sanitized, localImages }
}
