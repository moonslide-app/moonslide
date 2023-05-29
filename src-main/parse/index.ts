import { Presentation, Slide } from '../../src-shared/entities/Presentation'
import { parsePresentationConfig } from '../../src-shared/entities/PresentationConfig'
import { mergeWithDefaults, parseSlideConfig } from '../../src-shared/entities/SlideConfig'
import { YAMLError, parse as yamlParse } from 'yaml'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { findAndLoadTemplate } from '../presentation/template'
import { buildHTMLSlide, buildHTMLPresentation, concatSlidesHtml } from '../presentation/htmlBuilder'
import { parseMarkdown } from './markdown'
import { LocalImage, isLikelyPath, transformImagePath } from './imagePath'
import { MissingStartSeparatorError, YamlConfigError, wrapErrorIfThrows } from '../../src-shared/errors/WrappedError'

export const FIRST_SLIDE_SEPERATOR = '---'
const SLIDE_SEPARATOR = '\n---'
const SLOT_SEPERATOR = '\n***'

export async function parse(request: ParseRequest): Promise<Presentation> {
    const { markdownContent, markdownFilePath } = request
    const { localImages, presentationConfig, slidesMarkdown, slidesConfig } = parseConfig(markdownContent, request)

    const template = await findAndLoadTemplate(presentationConfig.template, markdownFilePath)

    const layouts = await template.getLayouts()
    function getLayout(name: string | undefined) {
        return layouts.layoutsHtml[name ?? ''] ?? layouts.defaultLayoutHtml
    }

    const slideWrapperHtml = await template.getSlideHtml()
    const templateConfig = template.getConfigLocalFile()

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
            const slideHtml = buildHTMLSlide(htmlLayout, slideWrapperHtml, { slots, slideConfig })

            const previewHtml = await buildHTMLPresentation({
                slidesHtml: slideHtml,
                presentationConfig,
                templateConfig,
                type: 'preview-small',
            })

            return { config: slideConfig, markdown, slideHtml, previewHtml }
        })
    )

    const slidesHtml = concatSlidesHtml(parsedSlides.map(slide => slide.slideHtml))

    const previewHtml = await buildHTMLPresentation({
        slidesHtml,
        presentationConfig,
        templateConfig,
        type: 'preview-fullscreen',
    })

    return {
        config: presentationConfig,
        slides: parsedSlides,
        slidesHtml,
        previewHtml,
        layoutsHtml: layouts.layoutsHtml,
        images: localImages,
        resolvedPaths: {
            templateFolder: template.folderPath,
            markdownFile: markdownFilePath,
        },
    }
}

function parseConfig(markdownContent: string, request: ParseRequest) {
    const hasContent = markdownContent && markdownContent.trim()

    if (hasContent && !markdownContent.startsWith(FIRST_SLIDE_SEPERATOR)) {
        throw new MissingStartSeparatorError(FIRST_SLIDE_SEPERATOR)
    }

    const withoutFirstSeperator = markdownContent.substring(FIRST_SLIDE_SEPERATOR.length)
    const separated = hasContent ? withoutFirstSeperator.split(SLIDE_SEPARATOR) : []
    const trimmed = separated.map(part => part.trim())

    const slidesMarkdown = trimmed.filter((_, idx) => idx % 2 == 1)
    const yamlConfigParts = trimmed.filter((_, idx) => idx % 2 == 0)
    const jsonConfigParts = yamlConfigParts.map((yml, idx) =>
        wrapErrorIfThrows(
            () => parseSlideYaml(yml),
            error => new YamlConfigError(idx + 1, error)
        )
    )

    const presentationConfig = wrapErrorIfThrows(
        () => parsePresentationConfig(jsonConfigParts[0]),
        err => new YamlConfigError(1, err)
    )

    const localImages: LocalImage[] = []
    const slidesConfig = jsonConfigParts
        .map((json, idx) =>
            wrapErrorIfThrows(
                () => parseSlideConfig(json),
                error => new YamlConfigError(idx + 1, error)
            )
        )
        .map(slideConfig => mergeWithDefaults(slideConfig, presentationConfig.defaults))
        .map(slideConfig => {
            const data = slideConfig.data ?? {}
            Object.keys(data).forEach(key => {
                const value = data[key]
                if (isLikelyPath(value)) {
                    const localImage = transformImagePath(value, request)
                    if (localImage) {
                        data[key] = localImage.transformedPath
                        localImages.push(localImage)
                    }
                }
            })
            slideConfig.data = data
            return slideConfig
        })

    return {
        localImages,
        presentationConfig,
        slidesMarkdown,
        slidesConfig,
    }
}

function parseSlideYaml(content: string) {
    let strippedContent = content
    // This loop tries to strip away lines which are currently beeing edited
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const parsed = yamlParse(strippedContent)

            // This clause catches the case, that a separator is
            // beeing typed (-) and parsed as an array
            if (Array.isArray(parsed) && parsed.length == 1 && !parsed[0]) {
                return undefined
            }

            // If it is not an object, it means that it is likely
            // a primitive value (which means the user is typing the first value)
            // we don't want to display an error in this case and return undefined
            if (typeof parsed === 'object') return parsed
            else return undefined
        } catch (error) {
            if (error instanceof YAMLError) {
                if (error.code === 'MISSING_CHAR') {
                    const removeLine = error.linePos?.[0].line
                    if (removeLine) {
                        strippedContent = removeLineFromString(strippedContent, removeLine)
                        continue
                    }
                }
            }
            throw error
        }
    }
}

function removeLineFromString(string: string, line: number): string {
    const split = string.split('\n')
    split.splice(line - 1, 1)
    return split.join('\n')
}
