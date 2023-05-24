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
import { MissingStartSeparatorError, YamlConfigError, wrapErrorIfThrows } from '../../src-shared/errors/WrappingError'

export const FIRST_SLIDE_SEPERATOR = '---'
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

    if (hasContent && !markdownContent.startsWith(FIRST_SLIDE_SEPERATOR)) {
        throw new MissingStartSeparatorError()
    }

    const withoutFirstSeperator = markdownContent.substring(FIRST_SLIDE_SEPERATOR.length)
    const separated = hasContent ? withoutFirstSeperator.split(SLIDE_SEPARATOR) : []
    const trimmed = separated.map(part => part.trim())

    const slidesMarkdown = trimmed.filter((_, idx) => idx % 2 == 1)
    const yamlConfigParts = trimmed.filter((_, idx) => idx % 2 == 0)
    const jsonConfigParts = yamlConfigParts.map((yml, idx) =>
        wrapErrorIfThrows(
            () => yamlParse(yml),
            error => new YamlConfigError(idx, error)
        )
    )

    const presentationConfig = wrapErrorIfThrows(
        () => parsePresentationConfig(jsonConfigParts[0]),
        err => new YamlConfigError(0, err)
    )

    const slidesConfig = jsonConfigParts
        .map((json, idx) =>
            wrapErrorIfThrows(
                () => parseSlideConfig(json),
                error => new YamlConfigError(idx, error)
            )
        )
        .map(slideConfig => mergeWithDefaults(slideConfig, presentationConfig.defaults ?? {}))

    return {
        presentationConfig,
        slidesMarkdown,
        slidesConfig,
    }
}
