import { TEMPLATE_BASIC } from '../../src-main/helpers/assets'
import { z } from 'zod'

export const presentationConfigSchema = z.object({
    template: z.string().default(TEMPLATE_BASIC),
    theme: z.string().optional(),
    title: z.string().optional(),
    author: z.string().optional(),
})

export type PresentationConfig = z.infer<typeof presentationConfigSchema>

export function parsePresentationConfig(json: unknown): PresentationConfig {
    return presentationConfigSchema.parse(json ?? {})
}
