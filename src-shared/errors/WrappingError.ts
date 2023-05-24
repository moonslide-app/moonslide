import { FIRST_SLIDE_SEPERATOR } from '../../src-main/parse'

/*
 * ---------- Wrapping Error ----------
 */

export class WrappingError extends Error {
    readonly underyingError?: unknown

    constructor(message: string, underlyingError?: unknown) {
        super(message)
        this.name = 'WrappingError'
        this.underyingError = underlyingError
    }
}

export function wrapErrorIfThrows<T, U extends Error>(action: () => T, wrap: (error: unknown) => U): T {
    try {
        return action()
    } catch (error) {
        throw wrap(error)
    }
}

/*
 * ---------- Wrapping Error Implementations ----------
 */

export class MissingStartSeparatorError extends WrappingError {
    constructor() {
        super(`Missing start seperator '${FIRST_SLIDE_SEPERATOR}' at the start of the file.`)
    }
}

export class YamlConfigError extends WrappingError {
    readonly slideNumber: number

    constructor(slideNumber: number, underlyingError: unknown) {
        super(`The YAML config of slide number ${slideNumber} contains an error.`, underlyingError)
        this.slideNumber = slideNumber
    }
}

export class TemplateNotFoundError extends WrappingError {
    readonly templatePath: string

    constructor(templatePath: string, underlyingError: unknown) {
        super(`The requested template '${templatePath}' was not found.`, underlyingError)
        this.templatePath = templatePath
    }
}

export class TemplateConfigError extends WrappingError {
    constructor(underlyingError: unknown) {
        super('The is an error in the config.yml file of the template.', underlyingError)
    }
}

// TODO: All template functions like getPresentationHtml(),
// getLayouts() could produce custom errors.
