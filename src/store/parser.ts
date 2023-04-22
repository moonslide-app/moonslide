import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ParsedContent } from '../../src-shared/entities/ParsedContent'

export function parseMarkdown(markdownContent: string | undefined): ParsedContent {
    const markdownSlides = !markdownContent || !markdownContent.trim() ? [] : markdownContent.split('---')
    const htmlSlides = markdownSlides.map(page => {
        const parsed = marked.parse(page)
        const sanitized = DOMPurify.sanitize(parsed)
        return `<section>${sanitized}</section>`
    })
    const htmlString = htmlSlides.length === 0 ? '' : htmlSlides.reduce((prev, next) => `${prev}\n${next}`)
    const slideNumbers = htmlSlides.map((val, idx) => idx)
    return { markdownSlides, htmlSlides, slideNumbers, htmlString }
}
