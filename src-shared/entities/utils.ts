export function isNonNullable<T>(value: T | undefined | null): value is T {
    return value !== null && value !== undefined
}
