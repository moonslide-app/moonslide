import { z } from 'zod'

export const presentationConfigSchema = z.object({
    template: z.string().optional(),
    title: z.string().optional(),
    meta: z
        .object({
            author: z.string().optional(),
        })
        .optional(),
})

export type PresentationConfig = z.infer<typeof presentationConfigSchema>

export function parsePresentationConfig(json: unknown): PresentationConfig {
    return presentationConfigSchema.nullish().parse(json) ?? {}
}
