import { TEMPLATE_STANDARD } from '../../src-main/helpers/assets'
import { z } from 'zod'
import { slideConfigSchema } from './SlideConfig'

export const presentationConfigSchema = z.object({
    template: z.string().default(TEMPLATE_STANDARD),
    theme: z.string().optional(),
    title: z.string().optional(),
    author: z.string().optional(),
    defaults: slideConfigSchema.optional(),
})

export type PresentationConfig = z.infer<typeof presentationConfigSchema>

export function parsePresentationConfig(json: unknown): PresentationConfig {
    return presentationConfigSchema.parse(json ?? {})
}
