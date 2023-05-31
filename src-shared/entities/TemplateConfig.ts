import { gracefulStringSchema, nullishToArray, nullishToOptional, stringOrArraySchema } from './zodUtils'
import { parse } from 'yaml'
import { z } from 'zod'

const toolbarItemConfigSchema = z.object({
    key: z.string(),
    displayName: z.string().nullish().transform(nullishToOptional),
    hidden: z.boolean().nullish().transform(nullishToOptional),
})

const toolbarLayoutItemConfigSchema = toolbarItemConfigSchema.extend({
    slots: z.number().nullish().transform(nullishToOptional),
})

const toolbarEntryConfigSchema = z.object({
    name: z.string(),
    items: toolbarItemConfigSchema.array(),
})

const toolbarLayoutEntryConfigSchema = toolbarEntryConfigSchema
    .omit({ items: true })
    .extend({ items: toolbarLayoutItemConfigSchema.array() })

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
    toolbar: z
        .object({
            layouts: toolbarLayoutEntryConfigSchema.array().nullish().transform(nullishToArray),
            modifiers: toolbarEntryConfigSchema.array().nullish().transform(nullishToArray),
            slideClasses: toolbarEntryConfigSchema.array().nullish().transform(nullishToArray),
            dataTags: toolbarEntryConfigSchema.array().nullish().transform(nullishToArray),
        })
        .nullish()
        .transform(nullishToOptional),
})

export type ToolbarItemConfig = z.infer<typeof toolbarItemConfigSchema>
export type ToolbarLayoutItemConfig = z.infer<typeof toolbarLayoutItemConfigSchema>
export type ToolbarEntryConfig = z.infer<typeof toolbarEntryConfigSchema>
export type ToolbarLayoutEntryConfig = z.infer<typeof toolbarLayoutEntryConfigSchema>
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
        toolbar: config.toolbar,
    }
}

export function getThemeMatching(config: TemplateConfig, match: string | undefined) {
    const firstMatch = config.themes?.filter(theme => theme.name === match)[0]
    const firstDefault = config.themes?.filter(theme => theme.default)[0]
    return firstMatch ?? firstDefault
}
