import { marked } from 'marked'
import { Presentation, Slide } from '../../src-shared/entities/Presentation'
import { parsePresentationConfig } from '../../src-shared/entities/PresentationConfig'
import { parseSlideConfig } from '../../src-shared/entities/SlideConfig'
import { parse as yamlParse } from 'yaml'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { findAndLoadTemplate } from './template'
import { buildHTMLLayout } from './htmlBuilder'

const SLIDE_SEPARATOR = '\n---'
const SLOT_SEPERATOR = '\n\n'

export async function parse(request: ParseRequest): Promise<Presentation> {
    console.log('parsing')
    const { markdownContent, markdownFilePath } = request
    const { presentationConfig, slidesMarkdown, slidesConfig } = parseConfig(markdownContent)

    const template = await findAndLoadTemplate(presentationConfig.template, markdownFilePath)

    const layouts = await template.getLayouts()
    function getLayout(name: string | undefined) {
        if (!name) return undefined
        else return layouts.layoutsHtml[name]
    }

    const parsedSlides: Slide[] = slidesConfig.map((slideConfig, i) => {
        const markdown = slidesMarkdown[i] || ''
        const slots = markdown.split(SLOT_SEPERATOR).map(slot => {
            const parsed = marked.parse(slot)
            return parsed // DOMPurify.sanitize(parsed)
        })

        const htmlLayout = getLayout(slideConfig.layout)
        const html = buildHTMLLayout(htmlLayout, { slots })

        return { config: slideConfig, markdown, html }
    })

    const html =
        parsedSlides.length === 0
            ? ''
            : parsedSlides.map(slide => `<section>${slide.html}</section>`).reduce((prev, next) => `${prev}\n${next}`)

    return {
        config: presentationConfig,
        slides: parsedSlides,
        html,
        layoutsHtml: layouts.layoutsHtml,
        resolvedPaths: {
            templateFolder: template.folderPath,
            markdownFile: markdownFilePath,
        },
    }
}

function parseConfig(markdownContent: string) {
    const hasContent = markdownContent && markdownContent.trim()
    const separated = hasContent ? markdownContent.split(SLIDE_SEPARATOR) : []
    const trimmed = separated.map(part => part.trim())

    const slidesMarkdown = trimmed.filter((_, idx) => idx % 2 == 1)
    const yamlConfigParts = trimmed.filter((_, idx) => idx % 2 == 0)
    const jsonConfigParts = yamlConfigParts.map(yml => yamlParse(yml))
    const presentationConfig = parsePresentationConfig(jsonConfigParts[0])
    const slidesConfig = jsonConfigParts.map(json => parseSlideConfig(json))

    return {
        presentationConfig,
        slidesMarkdown,
        slidesConfig,
    }
}
