import { marked } from 'marked'
import DOMPurify from 'dompurify'

export type ParsedContent = {
    markdownPages: string[]
    htmlPages: string[]
    htmlString: string
}

export function parseMarkdown(markdownContent: string): ParsedContent {
    const markdownPages = markdownContent.split('---')
    const htmlPages = markdownPages.map(page => {
        const parsed = marked.parse(page)
        const sanitized = DOMPurify.sanitize(parsed)
        return `<section>${sanitized}</section>`
    })
    const htmlString = htmlPages.length === 0 ? '' : htmlPages.reduce((prev, next) => `${prev}\n${next}`)
    return { markdownPages, htmlPages, htmlString }
}
