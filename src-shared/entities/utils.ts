export function isNonNullable<T>(value: T | undefined | null): value is T {
    return value !== null && value !== undefined
}

/**
 * Executes the action, catches all errors and prints them to the console.
 * Returns an array, where the first value indicates the success and the second value
 * is the return value of the action or undefined.
 */
export async function doNotThrow<T>(action: () => Promise<T>): Promise<[boolean, T | undefined]> {
    let success = false
    let result: T | undefined = undefined
    try {
        result = await action()
        success = true
    } catch (error) {
        console.warn(error)
    }
    return [success, result]
}
