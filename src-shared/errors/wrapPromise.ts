export type WrappedValue<T> = {
    value?: T | undefined
    error?: unknown | undefined
}

export type WrappedPromise<T> = Promise<WrappedValue<T>>

export function wrapPromise<T>(promise: Promise<T>): WrappedPromise<T> {
    return promise.then(value => ({ value })).catch(error => ({ error }))
}

export async function unwrapPromise<T>(promise: WrappedPromise<T>): Promise<T> {
    const { value, error } = await promise
    if (value) return value
    else throw error
}
