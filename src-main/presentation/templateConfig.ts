import { parse } from 'yaml'
import { z } from 'zod'

const stringOrArray = z
    .string()
    .array()
    .or(z.string())
    .transform(input => {
        if (typeof input === 'string') return [input]
        else return input
    })

const templateConfigSchema = z.object({
    template: z.object({
        entry: z.string(),
        presentation: z.string(),
        stylesheets: stringOrArray.optional(),
    }),
    reveal: z.object({
        entry: z.string(),
        stylesheets: stringOrArray,
    }),
    layouts: z
        .object({
            name: z.string(),
            path: z.string(),
            default: z.boolean().optional(),
        })
        .array()
        .optional(),
    plugins: z.string().array().optional(),
    themes: z
        .object({
            name: z.string(),
            default: z.boolean().optional(),
            stylesheets: stringOrArray,
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
        template: {
            entry: mapPath(config.template.entry),
            presentation: mapPath(config.template.presentation),
            stylesheets: config.template.stylesheets?.map(mapPath),
        },
        reveal: {
            entry: mapPath(config.reveal.entry),
            stylesheets: config.reveal.stylesheets.map(mapPath),
        },
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
