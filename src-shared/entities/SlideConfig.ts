import { z } from 'zod'
import { gracefulStringSchema, nullishToOptional, stringOrArraySchema } from './zodUtils'

const slideConfigStripSchema = z.object({
    layout: gracefulStringSchema,
    class: stringOrArraySchema,
    data: z.object({}).passthrough().nullish().transform(nullishToOptional),
})

export function stripSlideConfigProperties<T extends Record<string, unknown>>(
    object: T
): Omit<T, keyof z.infer<typeof slideConfigStripSchema>> {
    const stripped = { ...object }
    delete stripped.layout
    delete stripped.class
    delete stripped.data
    return stripped
}

export const slideConfigSchema = slideConfigStripSchema.passthrough().transform(config =>
    slideConfigStripSchema.parse({
        ...config,
        data: { ...stripSlideConfigProperties(config) },
    })
)

export type SlideConfig = z.infer<typeof slideConfigSchema>

export function parseSlideConfig(json: unknown): SlideConfig {
    return slideConfigSchema.parse(json ?? {})
}

export function mergeWithDefaults(config: SlideConfig, defaults?: SlideConfig): SlideConfig {
    return {
        ...defaults,
        ...config,
        class: config.class.length > 0 ? config.class : defaults?.class ?? [],
        data: { ...defaults?.data, ...config.data },
    }
}
