import { z } from 'zod'
import { gracefulStringSchema, stringOrArraySchema } from './zodUtils'

export const slideConfigSchema = z.object({
    layout: gracefulStringSchema,
    transition: gracefulStringSchema,
    ['transition-speed']: gracefulStringSchema,
    class: stringOrArraySchema,
    style: z.object({}).passthrough().optional(),
})

export type SlideConfig = z.infer<typeof slideConfigSchema>

export function parseSlideConfig(json: unknown): SlideConfig {
    return slideConfigSchema.parse(json ?? {})
}

export function mergeWithDefaults(config: SlideConfig, defaults: SlideConfig) {
    return {
        layout: config.layout ?? defaults.layout,
        transition: config.transition ?? defaults.transition,
        ['transition-speed']: config['transition-speed'] ?? defaults['transition-speed'],
        class: [...(defaults.class ?? []), ...(config.class ?? [])],
        styles: { ...defaults.style, ...config.style },
    }
}
