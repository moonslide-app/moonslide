/*
 * ---------- Wrapped Error ----------
 */

import { YAMLError } from 'yaml'
import { ZodError } from 'zod'

export class WrappedError {
    readonly type = 'WrappedError'
    readonly title: string
    readonly message: string
    readonly underlyingErrorMessage?: string

    constructor(title: string, message: string, underlyingError?: unknown) {
        this.title = title
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

function formatPath(path: (string | number)[]): string {
    return path
        .map((item, idx) => {
            if (typeof item === 'number') return `[${item}]`
            else if (idx > 0) return `.${item}`
            else return item
        })
        .join('')
}

function extractUnderlyingErrorMessage(error: unknown): string | undefined {
    if (!error) return undefined

    if (error instanceof YAMLError) {
        return error.message
    } else if (error instanceof ZodError) {
        const message = 'Type-Errors occured at the following paths while parsing:\n'
        return message + error.issues.map(issue => `- ${formatPath(issue.path)}: ${issue.message}`).join('\n')
    } else if (error instanceof Error) {
        return error.message
    } else {
        return 'An unknown error occurred.'
    }
}

/*
 * ---------- Wrapped Error Implementations ----------
 */

export class MissingStartSeparatorError extends WrappedError {
    constructor(separator: string) {
        super('Missing Start Seperator', `Missing start seperator '${separator}' at the start of the file.`)
    }
}

export class YamlConfigError extends WrappedError {
    readonly slideNumber: number

    constructor(slideNumber: number, underlyingError: unknown) {
        super('YAML Config Error', `The YAML config of slide ${slideNumber} contains an error.`, underlyingError)
        this.slideNumber = slideNumber
    }
}

export class TemplateNotFoundError extends WrappedError {
    readonly templatePath: string

    constructor(templatePath: string, underlyingError: unknown) {
        super('Template Not Found', `The requested template '${templatePath}' was not found.`, underlyingError)
        this.templatePath = templatePath
    }
}

export class TemplateConfigError extends WrappedError {
    constructor(underlyingError: unknown) {
        super('Template Error', 'There is an error in the config.yml file of the template.', underlyingError)
    }
}

export class TemplatePathReferenceError extends WrappedError {
    readonly notFoundPath: string

    constructor(notFoundPath: string) {
        super('Template Error', `The template references the file '${notFoundPath}' which was not found.`)
        this.notFoundPath = notFoundPath
    }
}

export class ToolbarYamlConfigError extends WrappedError {
    readonly propertyName: string
    readonly filePath: string

    constructor(propertyName: string, filePath: string, underlyingError: unknown) {
        super(
            'Toolbar Config Error',
            `There is an error inside the config of the toolbar property '${propertyName}' (${filePath}).`,
            underlyingError
        )
        this.propertyName = propertyName
        this.filePath = filePath
    }
}
