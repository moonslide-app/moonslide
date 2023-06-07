import { SlideConfig } from '../../src-shared/entities/SlideConfig'
import {
    BASE_FILE_NAME,
    EXPORT_SCRIPT_FILE_NAME,
    PREVIEW_FULLSCREEN_SCRIPT_FILENAME,
    PREVIEW_SMALL_SCRIPT_FILENAME,
    loadAssetContent,
} from '../../src-main/helpers/assets'
import { TemplateConfig, getThemeMatching } from '../../src-shared/entities/TemplateConfig'
import { PresentationConfig } from '../../src-shared/entities/PresentationConfig'
import escapeHtml from 'escape-html'

// presentation
const STYLESHEETS_TOKEN = '@@stylesheets@@'
const TITLE_TOKEN = '@@title@@'
const AUTHOR_TOKEN = '@@author@@'
const SLIDES_TOKEN = '@@slides@@'
const REVEAL_TOKEN = '@@reveal@@'
const PLUGINS_TOKEN = '@@plugins@@'
const REVEAL_EDITOR_TOKEN = '@@reveal-editor@@'
const ENTRY_TOKEN = '@@entry@@'

// slide content
const CONTENT_TOKEN = '@@content@@'

// layout
const LAYOUT_SLOT_TOKEN = '@@slot@@'

/*
 * ---------- Build Presentation ----------
 */

export type HTMLPresentationBulidConfig = {
    slidesHtml: string
    presentationConfig: PresentationConfig
    templateConfig: TemplateConfig
    type: HTMLPresentationBuildType
}

export type HTMLPresentationBuildType = 'export' | 'preview-small' | 'preview-fullscreen'

export async function buildHTMLPresentation(config: HTMLPresentationBulidConfig): Promise<string> {
    const { slidesHtml, presentationConfig, templateConfig } = config

    let buildingFile = await loadAssetContent(BASE_FILE_NAME)
    const replaceToken = (token: string, content?: string) => {
        buildingFile = buildingFile.replace(token, content ?? '')
    }

    replaceToken(TITLE_TOKEN, escapeHtml(presentationConfig.title))
    replaceToken(AUTHOR_TOKEN, escapeHtml(presentationConfig.author))
    replaceToken(SLIDES_TOKEN, slidesHtml)

    replaceToken(STYLESHEETS_TOKEN, generateStylesheets(config))
    replaceToken(REVEAL_TOKEN, scriptWithSource(templateConfig.reveal.entry))
    replaceToken(PLUGINS_TOKEN, generatePluginScripts(templateConfig.scripts))
    replaceToken(REVEAL_EDITOR_TOKEN, await getRevealEditorScriptContent(config.type))
    replaceToken(ENTRY_TOKEN, scriptWithSource(templateConfig.entry))

    return buildingFile
}

async function getRevealEditorScriptContent(type: HTMLPresentationBuildType): Promise<string> {
    let scriptName = ''
    if (type === 'export') scriptName = EXPORT_SCRIPT_FILE_NAME
    else if (type === 'preview-fullscreen') scriptName = PREVIEW_FULLSCREEN_SCRIPT_FILENAME
    else if (type === 'preview-small') scriptName = PREVIEW_SMALL_SCRIPT_FILENAME

    const scriptContent = await loadAssetContent(scriptName)
    return `<script>${scriptContent}</script>`
}

function generatePluginScripts(pluginsPaths?: string[]): string {
    if (!pluginsPaths || pluginsPaths.length == 0) return ''
    return pluginsPaths.map(scriptWithSource).reduce((prev, curr) => `${prev}\n${curr}`)
}

function scriptWithSource(src: string) {
    return `<script src="${src}"></script>`
}

function generateStylesheets({ presentationConfig, templateConfig }: HTMLPresentationBulidConfig): string {
    const theme = getThemeMatching(templateConfig, presentationConfig.theme)
    const styleSheetPaths = [
        ...templateConfig.reveal.stylesheets,
        ...(theme?.stylesheets ?? []),
        ...(templateConfig.stylesheets ?? []),
    ]

    if (styleSheetPaths.length == 0) return ''
    return styleSheetPaths
        .map(styleSheetPath => `<link rel="stylesheet" href="${styleSheetPath}">`)
        .reduce((prev, curr) => `${prev}\n${curr}`)
}

/*
 * ---------- Build Slides ----------
 */

export function concatSlidesHtml(slidesHtml: string[]): string {
    return slidesHtml.length === 0 ? '' : slidesHtml.reduce((prev, next) => `${prev}\n${next}`)
}

/*
 * ---------- Build Slide ----------
 */

export type HTMLSlideContent = {
    slots: string[]
    slideConfig: SlideConfig
}

export function buildHTMLSlide(
    layoutFileHtml: string | undefined,
    slideWrapperHtml: string | undefined,
    content: HTMLSlideContent
): string {
    const slideWrapper = slideWrapperHtml ?? CONTENT_TOKEN
    let buildingFile = layoutFileHtml ?? LAYOUT_SLOT_TOKEN
    const occurences = (buildingFile.match(RegExp(LAYOUT_SLOT_TOKEN, 'g')) || []).length

    if (occurences >= content.slots.length) {
        for (let i = 0; i < occurences; i++) {
            buildingFile = buildingFile.replace(LAYOUT_SLOT_TOKEN, content.slots[i] || '')
        }
    } else {
        const slots = []
        for (let i = 0; i < occurences; i++) {
            if (i + 1 < occurences) slots.push(content.slots[i] ?? '')
            else {
                // merge rest of slots into last slot
                const rest = content.slots.slice(i)
                if (rest.length <= 1) slots.push(...rest)
                else slots.push(rest.reduce((prev, next) => `${prev}${next}`))
            }
        }

        slots.forEach(slot => {
            buildingFile = buildingFile.replace(LAYOUT_SLOT_TOKEN, slot)
        })
    }

    // Wrap slide into the slideWrapper
    buildingFile = slideWrapper.replace(CONTENT_TOKEN, buildingFile)

    const classes = content.slideConfig.class
    const dataTags = content.slideConfig.data ?? {}

    let sectionOpenTag = `<section`
    if (classes.length > 0) sectionOpenTag += ` class="${escapeHtml(classes.join(' '))}"`
    Object.entries(dataTags).forEach(([key, value]) => {
        sectionOpenTag += ` data-${escapeHtml(key)}="${value ? escapeHtml(value.toString()) : ''}"`
    })
    sectionOpenTag += '>'

    buildingFile = `${sectionOpenTag}${buildingFile}</section>`
    return buildingFile
}
