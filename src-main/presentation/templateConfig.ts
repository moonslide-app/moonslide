import {
    gracefulStringSchema,
    nullishToArray,
    nullishToOptional,
    stringOrArraySchema,
} from '../../src-shared/entities/zodUtils'
import { parse } from 'yaml'
import { z } from 'zod'

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
})

export type TemplateConfig = z.infer<typeof templateConfigSchema>

export function parseTemplateConfig(yamlString: string): TemplateConfig {
    const parsedObject = parse(yamlString)
    return templateConfigSchema.parse(parsedObject)
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
    }
}

export function getThemeMatching(config: TemplateConfig, match: string | undefined) {
    const firstMatch = config.themes?.filter(theme => theme.name === match)[0]
    const firstDefault = config.themes?.filter(theme => theme.default)[0]
    return firstMatch ?? firstDefault
}
