import { parse } from 'yaml'
import { z } from 'zod'

const templateConfigSchema = z.object({
    entry: z.string(),
    reveal: z.string(),
    slide: z.string(),
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
