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
})

export type TemplateConfig = z.infer<typeof templateConfigSchema>

export function parseTemplateConfig(yamlString: string): TemplateConfig {
    const parsedObject = parse(yamlString)
    return templateConfigSchema.parse(parsedObject)
}

export function mapTemplateConfigPaths(config: TemplateConfig, map: (path: string) => string): TemplateConfig {
    return {
        entry: map(config.entry),
        reveal: map(config.reveal),
        presentation: map(config.presentation),
        stylesheets: config.stylesheets?.map(styleSheet => map(styleSheet)),
        layouts: config.layouts?.map(layout => ({ ...layout, path: map(layout.path) })),
        plugins: config.plugins?.map(plugin => map(plugin)),
    }
}
