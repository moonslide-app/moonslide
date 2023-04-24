// presentation
const SLIDE_TOKEN = '@@slide@@'
const STYLESHEETS_TOKEN = '@@stylesheets@@'
const SCRIPTS_TOKEN = '@@scripts@@'
const TITLE_TOKEN = '@@title@@'
const AUTHOR_TOKEN = '@@author@@'

// slides
const SLIDES_CONTENT_TOKEN = '@@content@@'

// layout
const LAYOUT_SLOT_TOKEN = '@@slot@@'

/*
 * ---------- Build Presentation ----------
 */

export type HTMLPresentationContent = {
    slideContent?: string
    scriptPaths?: string[]
    styleSheetPaths?: string[]
    meta?: {
        title?: string
        author?: string
    }
}

export function buildHTMLPresentation(baseFileHtml: string, content: HTMLPresentationContent): string {
    let buildingFile = baseFileHtml
    const replaceToken = (token: string, content?: string) => {
        buildingFile = buildingFile.replace(token, content ?? '')
    }

    replaceToken(SLIDE_TOKEN, content?.slideContent)
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

export type HTMLSlideContent = {
    content: string
}

export function buildHTMLSlide(baseSlideHtml: string, content: HTMLSlideContent): string {
    return baseSlideHtml.replace(SLIDES_CONTENT_TOKEN, content.content)
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
    const slots = []
    for (let i = 0; i < occurences; i++) {
        if (i + 1 < occurences) slots.push(content.slots[i])
        else {
            const rest = content.slots.slice(i)
            if (rest.length <= 1) slots.push(...rest)
            else slots.push(rest.reduce((prev, next) => `${prev}${next}`))
        }
    }

    slots.forEach(slot => {
        buildingFile = buildingFile.replace(LAYOUT_SLOT_TOKEN, slot)
    })
    return buildingFile
}
