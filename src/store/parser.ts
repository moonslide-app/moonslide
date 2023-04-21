import { marked } from 'marked'
import { create } from 'zustand'
import DOMPurify from 'dompurify'

type ParserState = {
    markdown: string
    setMarkdown(newValue: string): void
    pages(): string[]
    htmlPages(): string[]
    htmlString(): string
}

export const useParserStore = create<ParserState>()((set, get) => ({
    markdown: '',
    setMarkdown: markdown => set(state => ({ ...state, markdown })),
    pages: () => get().markdown.split('---'),
    htmlPages() {
        return get()
            .pages()
            .map(page => {
                const parsed = marked.parse(page)
                const sanitized = DOMPurify.sanitize(parsed)
                return `<section>${sanitized}</section>`
            })
    },
    htmlString() {
        const pages = get().htmlPages()
        if (pages.length == 0) return ''
        else return pages.reduce((prev, next) => `${prev}\n${next}`)
    },
}))
