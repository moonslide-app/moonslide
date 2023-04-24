import { BASE_FILE_NAME, loadAssetContent } from './assets'

const SLIDE_TOKEN = '@@slide@@'
const STYLESHEETS_TOKEN = '@@stylesheets@@'
const SCRIPTS_TOKEN = '@@scripts@@'
const TITLE_TOKEN = '@@title@@'
const AUTHOR_TOKEN = '@@author@@'

export type BuilderConfig = {
    slideContent?: string
    scriptPaths?: string[]
    styleSheetPaths?: string[]
    meta?: {
        title?: string
        author?: string
    }
}

export async function buildHTMLPresentation(config: BuilderConfig): Promise<string> {
    let buildingFile = await loadAssetContent(BASE_FILE_NAME)
    const replaceToken = (token: string, content?: string) => {
        buildingFile = buildingFile.replace(token, content ?? '')
    }

    replaceToken(SLIDE_TOKEN, config?.slideContent)
    replaceToken(STYLESHEETS_TOKEN, generateStylesheets(config.styleSheetPaths))
    replaceToken(SCRIPTS_TOKEN, generateScripts(config.scriptPaths))
    replaceToken(TITLE_TOKEN, config?.meta?.title)
    replaceToken(AUTHOR_TOKEN, config?.meta?.author)

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
