import MarkdownIt from 'markdown-it'
import MarkdownItAttrs from 'markdown-it-attrs'
import MarkdownItBracketedSpans from 'markdown-it-bracketed-spans'
import MarkdownItReplaceLink from 'markdown-it-replace-link'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { LocalImage, transformImagePath } from './imagePath'
import { transformTokens } from './transformTokens'

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

    const markdownItOptions: MarkdownIt.Options = {
        html: true,
        replaceLink,
    } as MarkdownIt.Options

    const markdownIt = new MarkdownIt(markdownItOptions)
        .use(MarkdownItAttrs)
        .use(MarkdownItBracketedSpans)
        .use(MarkdownItReplaceLink)

    const parsed = markdownIt.parse(request.markdownContent, {})
    const transformed = transformTokens(parsed)
    const rendered = markdownIt.renderer.render(transformed, {}, {})
    return { html: rendered, localImages }
}
