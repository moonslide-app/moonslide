import { z } from 'zod'
import { gracefulStringSchema, nullishToOptional, stringOrArraySchema } from './zodUtils'

export const finalSlideConfigSchema = z.object({
    layout: gracefulStringSchema,
    class: stringOrArraySchema,
    data: z.object({}).passthrough().nullish().transform(nullishToOptional),
})

export const slideConfigSchema = finalSlideConfigSchema.passthrough().transform(config => ({
    ...config,
    data: {
        ...config,
        ...config.data,
        layout: undefined,
        class: undefined,
    },
}))

export type SlideConfig = z.infer<typeof finalSlideConfigSchema>

export function parseSlideConfig(json: unknown): SlideConfig {
    return finalSlideConfigSchema.parse(slideConfigSchema.parse(json ?? {}))
}

export function mergeWithDefaults(config: SlideConfig, defaults?: SlideConfig): SlideConfig {
    return { ...defaults, ...config, data: { ...defaults?.data, ...config.data } }
}
