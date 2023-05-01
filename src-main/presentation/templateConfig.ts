import { parse } from 'yaml'
import { z } from 'zod'

const templateConfigSchema = z.object({
    entry: z.string(),
    reveal: z.string(),
    presentation: z.string(),
    stylesheets: z.string().array().optional(),
    layouts: z
        .object({
            name: z.string(),
            path: z.string(),
        })
        .array()
        .optional(),
    plugins: z.string().array().optional(),
    themes: z
        .object({
            name: z.string(),
            default: z.boolean().optional(),
            stylesheets: z.string().array(),
        })
        .array()
        .optional(),
})

export type TemplateConfig = z.infer<typeof templateConfigSchema>

export function parseTemplateConfig(yamlString: string): TemplateConfig {
    const parsedObject = parse(yamlString)
    return templateConfigSchema.parse(parsedObject)
}

export function mapTemplateConfigPaths(config: TemplateConfig, mapPath: (path: string) => string): TemplateConfig {
    return {
        entry: mapPath(config.entry),
        reveal: mapPath(config.reveal),
        presentation: mapPath(config.presentation),
        stylesheets: config.stylesheets?.map(mapPath),
        layouts: config.layouts?.map(layout => ({ ...layout, path: mapPath(layout.path) })),
        plugins: config.plugins?.map(mapPath),
        themes: config.themes?.map(theme => ({ ...theme, stylesheets: theme.stylesheets.map(mapPath) })),
    }
}

export function getThemeMatching(config: TemplateConfig, match: string | undefined) {
    const firstMatch = config.themes?.filter(theme => theme.name === match)[0]
    const firstDefault = config.themes?.filter(theme => theme.default)[0]
    return firstMatch ?? firstDefault
}
