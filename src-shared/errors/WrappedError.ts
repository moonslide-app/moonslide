/*
 * ---------- Wrapped Error ----------
 */

import { YAMLError } from 'yaml'
import { ZodError } from 'zod'

export class WrappedError {
    readonly type = 'WrappedError'
    readonly message: string
    readonly underlyingErrorMessage?: string

    constructor(message: string, underlyingError?: unknown) {
        this.message = message
        this.underlyingErrorMessage = extractUnderlyingErrorMessage(underlyingError)
    }
}

export function isWrappedError(object: unknown): object is WrappedError {
    const error = object as WrappedError
    return (
        typeof error === 'object' &&
        error.type === 'WrappedError' &&
        typeof error.message === 'string' &&
        (typeof error.underlyingErrorMessage === 'string' || typeof error.underlyingErrorMessage === 'undefined')
    )
}

export function wrapErrorIfThrows<T, U extends WrappedError>(action: () => T, wrap: (error: unknown) => U): T {
    try {
        return action()
    } catch (error) {
        throw wrap(error)
    }
}

function extractUnderlyingErrorMessage(error: unknown): string | undefined {
    if (!error) return undefined

    if (error instanceof YAMLError) {
        console.log('Yaml Error')
        return error.message
    } else if (error instanceof ZodError) {
        const { fieldErrors } = error.flatten()
        return Object.entries(fieldErrors)
            .map(([key, value]) => {
                return `- Property '${key}': ${value?.join(', ') ?? 'Unknown error'}`
            })
            .join('\n')
        return
    } else if (error instanceof Error) {
        return 'Other Error'
    } else {
        return 'An unknown error occurred.'
    }
}

/*
 * ---------- Wrapped Error Implementations ----------
 */

export class MissingStartSeparatorError extends WrappedError {
    constructor(separator: string) {
        super(`Missing start seperator '${separator}' at the start of the file.`)
    }
}

export class YamlConfigError extends WrappedError {
    readonly slideNumber: number

    constructor(slideNumber: number, underlyingError: unknown) {
        super(`The YAML config of slide number ${slideNumber} contains an error.`, underlyingError)
        this.slideNumber = slideNumber
    }
}

export class TemplateNotFoundError extends WrappedError {
    readonly templatePath: string

    constructor(templatePath: string, underlyingError: unknown) {
        super(`The requested template '${templatePath}' was not found.`, underlyingError)
        this.templatePath = templatePath
    }
}

export class TemplateConfigError extends WrappedError {
    constructor(underlyingError: unknown) {
        super('The is an error in the config.yml file of the template.', underlyingError)
    }
}

// TODO: All template functions like getPresentationHtml(),
// getLayouts() could produce custom errors.
