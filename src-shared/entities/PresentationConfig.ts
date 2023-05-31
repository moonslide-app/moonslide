import { TEMPLATE_STANDARD } from '../../src-main/helpers/assets'
import { z } from 'zod'
import { slideConfigSchema } from './SlideConfig'
import { gracefulStringSchema, nullishToOptional } from './zodUtils'

export const presentationConfigSchema = z.object({
    template: gracefulStringSchema.transform(input => (input ? input : TEMPLATE_STANDARD)),
    theme: gracefulStringSchema,
    title: gracefulStringSchema,
    author: gracefulStringSchema,
    defaults: slideConfigSchema.nullish().transform(nullishToOptional),
})

export function stripPresentationConfigProperties<T extends Record<string, unknown>>(
    object: T
): Omit<T, keyof PresentationConfig> {
    const stripped = { ...object }
    delete stripped.template
    delete stripped.theme
    delete stripped.title
    delete stripped.author
    delete stripped.defaults
    return stripped
}

export type PresentationConfig = z.infer<typeof presentationConfigSchema>

export function parsePresentationConfig(json: unknown): PresentationConfig {
    return presentationConfigSchema.parse(json ?? {})
}
