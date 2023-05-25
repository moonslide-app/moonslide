import { z } from 'zod'

export const stringOrArraySchema = z
    .string()
    .or(z.string().array())
    .nullish()
    .transform(input => {
        if (typeof input === 'string') return [input]
        else if (!input) return []
        else return input
    })

/**
 * This input schema allows string, null, undefined and
 * transforms it to string or undefined.
 */
export const gracefulStringSchema = z.string().nullish().transform(nullishToOptional)

export function nullishToOptional<T>(nullish: T | null | undefined): T | undefined {
    return !nullish ? undefined : nullish
}

export function nullishToArray<T>(nullish: T[] | null | undefined): T[] {
    return !nullish ? [] : nullish
}
