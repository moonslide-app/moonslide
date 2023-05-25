import { z } from 'zod'

export const stringOrArraySchema = z
    .string()
    .or(z.string().array())
    .nullish()
    .transform(nullishToOptional)
    .transform(input => {
        if (typeof input === 'string') return [input]
        else return input
    })

/**
 * This input schema allows string, number, null, undefined and
 * transforms it to string or undefined.
 * This should try to allow almost all string like input values from config files
 * without raising an error.
 */
export const gracefulStringSchema = z.string().nullish().transform(nullishToOptional)

export function nullishToOptional<T>(nullish: T | null | undefined): T | undefined {
    return !nullish ? undefined : nullish
}
