import { z } from 'zod'

export const slideConfigSchema = z.object({
    layout: z.string().optional(),
})

export type SlideConfig = z.infer<typeof slideConfigSchema>

export function parseSlideConfig(json: unknown): SlideConfig {
    return slideConfigSchema.nullish().parse(json) ?? {}
}
