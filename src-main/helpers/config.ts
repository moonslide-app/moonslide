import { parse } from 'yaml'
import { z } from 'zod'

const configSchema = z.object({
    meta: z.object({
        title: z.string(),
        author: z.string(),
    }),
    stylesheets: z.string().array(),
    plugins: z.string().array(),
    entry: z.string(),
    slide: z.string(),
})

export type Config = z.infer<typeof configSchema>

export function parseConfig(yamlString: string): Config {
    const parsedObject = parse(yamlString)
    return configSchema.parse(parsedObject)
}
