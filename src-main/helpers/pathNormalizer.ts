import { resolve, relative, normalize } from 'path'
import { replaceBackwardSlash } from '../../src-shared/helpers/pathNormalizer'

/**
 * Resoslve paths and replace backward slashes with forward slashes.
 * @param paths The paths to resolve.
 * @returns The resolved paths with forward slashes.
 */
export function resolveWithForwardSlash(...paths: string[]): string {
    return replaceBackwardSlash(resolve(...paths))
}

/**
 * Resolve relative path and replace backward slashes with forward slashes.
 * @param from Path from.
 * @param to Path to.
 * @returns Relatively resolved paths with forward slashes.
 */
export function relativeWithForwardSlash(from: string, to: string): string {
    return replaceBackwardSlash(relative(from, to))
}

/**
 * Normalize a path and replace backward slashes with forward slashes.
 * @param path The path to normalize.
 * @returns The normalized path, with backslashes replaced to forward slashes.
 */
export function normalizeWithForwardSlash(path: string): string {
    return replaceBackwardSlash(normalize(path))
}
