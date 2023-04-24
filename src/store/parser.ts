import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ParsedPresentation, ParsedSlide } from '../../src-shared/entities/ParsedPresentation'
import { parse } from 'yaml'
import { parsePresentationConfig } from '../../src-shared/entities/PresentationConfig'
import { parseSlideConfig } from '../../src-shared/entities/SlideConfig'

const SEPARATOR = '---'

type ParsedMarkdown = Omit<ParsedPresentation, 'markdownFilePath'>

export function parseMarkdown(markdownContent: string | undefined): ParsedMarkdown {
    const seperated = !markdownContent || !markdownContent.trim() ? [] : markdownContent.split(SEPARATOR)

    const markdownParts = seperated.filter((_, idx) => idx % 2 == 1)

    const yamlConfigParts = seperated.filter((_, idx) => idx % 2 == 0)
    const jsonConfigParts = yamlConfigParts.map(yml => parse(yml))
    const presentationConfig = parsePresentationConfig(jsonConfigParts[0])
    const slidesConfig = jsonConfigParts.map(json => parseSlideConfig(json))

    const parsedSlides: ParsedSlide[] = slidesConfig.map((slideConfig, i) => {
        const markdown = markdownParts[i] || ''
        const parsed = marked.parse(markdown)
        const sanitized = DOMPurify.sanitize(parsed)
        return {
            config: slideConfig,
            markdown,
            html: sanitized,
        }
    })

    const htmlString =
        parsedSlides.length === 0
            ? ''
            : parsedSlides.map(slide => `<section>${slide.html}</section>`).reduce((prev, next) => `${prev}\n${next}`)

    return { config: presentationConfig, slides: parsedSlides, htmlString }
}
