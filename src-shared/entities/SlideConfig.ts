import { z } from 'zod'

const stringOrArraySchema = z
    .string()
    .or(z.string().array())
    .optional()
    .transform(input => {
        if (typeof input === 'string') return [input]
        else return input
    })

export const slideConfigSchema = z.object({
    layout: z.string().optional(),
    transition: z.string().optional(),
    ['transition-speed']: z.string().optional(),
    class: stringOrArraySchema,
    style: z.object({}).passthrough().optional(),
})

export type SlideConfig = z.infer<typeof slideConfigSchema>

export function parseSlideConfig(json: unknown): SlideConfig {
    return slideConfigSchema.parse(json ?? {})
}
