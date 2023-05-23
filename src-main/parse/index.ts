import { Presentation, Slide } from '../../src-shared/entities/Presentation'
import { parsePresentationConfig } from '../../src-shared/entities/PresentationConfig'
import { mergeWithDefaults, parseSlideConfig } from '../../src-shared/entities/SlideConfig'
import { parse as yamlParse } from 'yaml'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { findAndLoadTemplate } from '../presentation/template'
import {
    buildHTMLLayout,
    buildHTMLPresentation,
    buildHTMLPresentationContent,
    concatSlidesHtml,
} from '../presentation/htmlBuilder'
import { parseMarkdown } from './markdown'
import { LocalImage } from './imagePath'

const SLIDE_SEPARATOR = '\n---'
const SLOT_SEPERATOR = '\n***'

export async function parse(request: ParseRequest): Promise<Presentation> {
    const { markdownContent, markdownFilePath } = request
    const { presentationConfig, slidesMarkdown, slidesConfig } = parseConfig(markdownContent)

    const template = await findAndLoadTemplate(presentationConfig.template, markdownFilePath)

    const layouts = await template.getLayouts()
    function getLayout(name: string | undefined) {
        return layouts.layoutsHtml[name ?? ''] ?? layouts.defaultLayoutHtml
    }

    const localImages: LocalImage[] = []
    const presentationBase = await template.getPresentationHtml()
    const parsedSlides: Slide[] = await Promise.all(
        slidesConfig.map(async (slideConfig, i) => {
            const markdown = slidesMarkdown[i] || ''
            const parseResults = markdown
                .split(SLOT_SEPERATOR)
                .map(slot => slot.trim())
                .map(slot => parseMarkdown({ ...request, markdownContent: slot }))

            const slots = parseResults.map(res => res.html)
            const images = parseResults.flatMap(res => res.localImages)
            localImages.push(...images)

            const htmlLayout = getLayout(slideConfig.layout)
            const contentHtml = buildHTMLLayout(htmlLayout, { slots, slideConfig })
            const presentationHtml = buildHTMLPresentationContent(presentationBase, contentHtml)

            const previewHtml = await buildHTMLPresentation({
                presentationHtml,
                presentationConfig: presentationConfig,
                templateConfig: template.getConfigLocalFile(),
                type: 'preview-small',
            })

            return { config: slideConfig, markdown, contentHtml, presentationHtml, previewHtml }
        })
    )

    const contentHtml = concatSlidesHtml(parsedSlides.map(slide => slide.contentHtml))
    const presentationHtml = buildHTMLPresentationContent(presentationBase, contentHtml)

    const previewHtml = await buildHTMLPresentation({
        presentationHtml,
        presentationConfig: presentationConfig,
        templateConfig: template.getConfigLocalFile(),
        type: 'preview-fullscreen',
    })

    return {
        config: presentationConfig,
        slides: parsedSlides,
        contentHtml,
        presentationHtml,
        previewHtml,
        layoutsHtml: layouts.layoutsHtml,
        images: localImages,
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
    const slidesConfig = jsonConfigParts
        .map(json => parseSlideConfig(json))
        .map(slideConfig => mergeWithDefaults(slideConfig, presentationConfig.defaults ?? {}))

    return {
        presentationConfig,
        slidesMarkdown,
        slidesConfig,
    }
}
