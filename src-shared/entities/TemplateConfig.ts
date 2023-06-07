import { gracefulStringSchema, nullishToArray, nullishToOptional, stringOrArraySchema } from './zodUtils'
import { parse as yamlParse } from 'yaml'
import { z } from 'zod'
import { Toolbar, loadToolbarFromPaths, toolbarFilePathsSchema } from './Toolbar'
import { InvalidThemeError, TemplateConfigError, wrapErrorIfThrows } from '../../src-shared/errors/WrappedError'

const templateConfigSchema = z.object({
    entry: z.string(),
    slide: gracefulStringSchema,
    reveal: z.object({
        entry: z.string(),
        stylesheets: stringOrArraySchema,
    }),
    stylesheets: stringOrArraySchema,
    scripts: stringOrArraySchema,
    layouts: z
        .object({
            name: z.string(),
            path: z.string(),
            default: z.boolean().nullish().transform(nullishToOptional),
        })
        .array()
        .nullish()
        .transform(nullishToArray),
    themes: z
        .object({
            name: z.string(),
            default: z.boolean().nullish().transform(nullishToOptional),
            stylesheets: stringOrArraySchema,
        })
        .array()
        .nullish()
        .transform(nullishToArray),
    toolbar: toolbarFilePathsSchema.nullish().transform(nullishToOptional),
})

/**
 * Contains the paths for the toolbar config files.
 */
type TemplateConfigWithToolbarPaths = z.infer<typeof templateConfigSchema>

export type TemplateConfig = Omit<TemplateConfigWithToolbarPaths, 'toolbar'> & {
    toolbar: Toolbar
}

export async function parseTemplateConfig(yamlString: string, templateFolderPath: string): Promise<TemplateConfig> {
    const templateConfig = wrapErrorIfThrows(
        () => templateConfigSchema.parse(yamlParse(yamlString)),
        error => new TemplateConfigError(error)
    )

    const paths = templateConfig.toolbar ?? {}
    return { ...templateConfig, toolbar: await loadToolbarFromPaths(paths, templateFolderPath) }
}

export function mapTemplateConfigPaths(config: TemplateConfig, mapPath: (path: string) => string): TemplateConfig {
    return {
        entry: mapPath(config.entry),
        slide: config.slide ? mapPath(config.slide) : undefined,
        reveal: {
            entry: mapPath(config.reveal.entry),
            stylesheets: config.reveal.stylesheets.map(mapPath),
        },
        stylesheets: config.stylesheets.map(mapPath),
        scripts: config.scripts.map(mapPath),
        layouts: config.layouts.map(layout => ({ ...layout, path: mapPath(layout.path) })),
        themes: config.themes?.map(theme => ({ ...theme, stylesheets: theme.stylesheets.map(mapPath) })),
        toolbar: config.toolbar,
    }
}

export function getThemeMatching(config: TemplateConfig, match: string | undefined) {
    if (!match) return config.themes.filter(theme => theme.default).at(0)

    const firstMatch = config.themes.filter(theme => theme.name === match).at(0)
    if (firstMatch === undefined) {
        const themeNames = config.themes.map(theme => theme.name)
        throw new InvalidThemeError(match, themeNames)
    } else return firstMatch
}
