// presentation
const PRESESENTATION_TOKEN = '@@presentation@@'
const STYLESHEETS_TOKEN = '@@stylesheets@@'
const SCRIPTS_TOKEN = '@@scripts@@'
const TITLE_TOKEN = '@@title@@'
const AUTHOR_TOKEN = '@@author@@'

// presentation content
const CONTENT_TOKEN = '@@content@@'

// layout
const LAYOUT_SLOT_TOKEN = '@@slot@@'

/*
 * ---------- Build Presentation ----------
 */

export type HTMLPresentation = {
    presentationContent?: string
    scriptPaths?: string[]
    styleSheetPaths?: string[]
    meta?: {
        title?: string
        author?: string
    }
}

export function buildHTMLPresentation(baseFileHtml: string, content: HTMLPresentation): string {
    let buildingFile = baseFileHtml
    const replaceToken = (token: string, content?: string) => {
        buildingFile = buildingFile.replace(token, content ?? '')
    }

    replaceToken(PRESESENTATION_TOKEN, content?.presentationContent)
    replaceToken(STYLESHEETS_TOKEN, generateStylesheets(content.styleSheetPaths))
    replaceToken(SCRIPTS_TOKEN, generateScripts(content.scriptPaths))
    replaceToken(TITLE_TOKEN, content?.meta?.title)
    replaceToken(AUTHOR_TOKEN, content?.meta?.author)

    return buildingFile
}

function generateScripts(scriptPaths?: string[]): string {
    if (!scriptPaths || scriptPaths.length == 0) return ''
    return scriptPaths.map(script => `<script src="${script}"></script>`).reduce((prev, curr) => `${prev}\n${curr}`)
}

function generateStylesheets(styleSheetPaths?: string[]): string {
    if (!styleSheetPaths || styleSheetPaths.length == 0) return ''
    return styleSheetPaths
        .map(styleSheetPath => `<link rel="stylesheet" href="${styleSheetPath}">`)
        .reduce((prev, curr) => `${prev}\n${curr}`)
}

/*
 * ---------- Build Slides ----------
 */

export type HTMLPresentationContent = {
    slidesHtml: string[]
}

export function buildHTMLPresentationContent(
    presentationContentBaseHtml: string,
    content: HTMLPresentationContent
): string {
    const slides =
        content.slidesHtml.length === 0
            ? ''
            : content.slidesHtml.map(slide => `<section>${slide}</section>`).reduce((prev, next) => `${prev}\n${next}`)
    return presentationContentBaseHtml.replace(CONTENT_TOKEN, slides)
}

/*
 * ---------- Build Layout ----------
 */

export type HTMLLayoutContent = {
    slots: string[]
}

export function buildHTMLLayout(layoutFileHtml: string | undefined, content: HTMLLayoutContent): string {
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
    return buildingFile
}
