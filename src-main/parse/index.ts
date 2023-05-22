import { Presentation, Slide, comparePresentations } from '../../src-shared/entities/Presentation'
import { parsePresentationConfig } from '../../src-shared/entities/PresentationConfig'
import { mergeWithDefaults, parseSlideConfig } from '../../src-shared/entities/SlideConfig'
import { parse as yamlParse } from 'yaml'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { findAndLoadTemplate } from '../presentation/template'
import { buildHTMLLayout, buildHTMLPresentation, buildHTMLPresentationContent } from '../presentation/htmlBuilder'
import { parseMarkdown } from './markdown'
import { LocalImage } from './imagePath'
import { presentationStore } from '../store'
import { PresentationStore } from '../../src-shared/entities/PresentationStore'

const SLIDE_SEPARATOR = '\n---'
const SLOT_SEPERATOR = '\n***'

export async function parse(request: ParseRequest): Promise<PresentationStore> {
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

            const previewHtml = await buildHTMLPresentation({
                contentHtml: buildHTMLPresentationContent(presentationBase, { slidesHtml: [contentHtml] }),
                presentationConfig: presentationConfig,
                templateConfig: template.getConfigLocalFile(),
                type: 'preview-small',
            })

            return { config: slideConfig, markdown, contentHtml, previewHtml }
        })
    )

    const contentHtml = buildHTMLPresentationContent(presentationBase, {
        slidesHtml: parsedSlides.map(slide => slide.contentHtml),
    })

    const previewHtml = await buildHTMLPresentation({
        contentHtml,
        presentationConfig: presentationConfig,
        templateConfig: template.getConfigLocalFile(),
        type: 'preview-fullscreen',
    })

    const presentation = {
        config: presentationConfig,
        slides: parsedSlides,
        contentHtml,
        previewHtml,
        layoutsHtml: layouts.layoutsHtml,
        images: localImages,
        resolvedPaths: {
            templateFolder: template.folderPath,
            markdownFile: markdownFilePath,
        },
    }

    return updateStore(presentation)
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

async function updateStore(newParsedPresentation: Presentation) {
    const { parsedPresentation, templateLastUpdate, themeLastUpdate, slidesLastUpdate } = presentationStore

    const newTimestamp = Date.now()
    const comparison = comparePresentations(parsedPresentation, newParsedPresentation)
    const newTemplateLastUpdate = comparison.templateChange ? newTimestamp : templateLastUpdate
    const newThemeLastUpdate = comparison.themeChange ? newTimestamp : themeLastUpdate
    const newSlidesLastUpdate = comparison.slideChanges.map((update, idx) =>
        update ? newTimestamp : slidesLastUpdate[idx]
    )

    presentationStore.parsedPresentation = newParsedPresentation
    presentationStore.templateLastUpdate = newTemplateLastUpdate
    presentationStore.themeLastUpdate = newThemeLastUpdate
    presentationStore.slidesLastUpdate = newSlidesLastUpdate

    return presentationStore
}
