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

// can be used 1 million days, no problem >.<
let uniqueId = 1
export function addUUID<T extends Record<string, unknown>>(object: T): T & { id: string } {
    return { ...object, id: `my-superb-id-${uniqueId++}` }
}

const DEFAULT_LIMIT = 100
export function limit<T>(array: T[]): T[] {
    if (array.length > DEFAULT_LIMIT) throw new Error(`Excceded the limit of ${DEFAULT_LIMIT} values inside an array.`)
    return array
}
