export type WrappedValue<T> = {
    wrappedValue?: {
        value: T
    }
    wrappedError?: {
        error: unknown
    }
}

export type WrappedPromise<T> = Promise<WrappedValue<T>>

export function wrapPromise<T>(promise: Promise<T>): WrappedPromise<T> {
    return promise.then(value => ({ wrappedValue: { value } })).catch(error => ({ wrappedError: { error } }))
}

export async function unwrapPromise<T>(promise: WrappedPromise<T>): Promise<T> {
    const { wrappedValue, wrappedError } = await promise
    if (wrappedValue) return wrappedValue.value
    else throw wrappedError?.error
}
