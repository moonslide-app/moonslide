import { TEMPLATE_STANDARD } from '../../src-main/helpers/assets'
import { z } from 'zod'
import { slideConfigSchema } from './SlideConfig'
import { gracefulStringSchema, nullishToOptional } from './zodUtils'

export const presentationConfigSchema = z.object({
    template: gracefulStringSchema.default(TEMPLATE_STANDARD),
    theme: gracefulStringSchema,
    title: gracefulStringSchema,
    author: gracefulStringSchema,
    defaults: slideConfigSchema.nullish().transform(nullishToOptional),
})

export type PresentationConfig = z.infer<typeof presentationConfigSchema>

export function parsePresentationConfig(json: unknown): PresentationConfig {
    return presentationConfigSchema.parse(json ?? {})
}
