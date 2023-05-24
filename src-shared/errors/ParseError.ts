import { ZodError } from 'zod'
import { FIRST_SLIDE_SEPERATOR } from '../../src-main/parse'
import { YAMLError } from 'yaml'

export class ParseError<T extends Error | unknown> extends Error {
    readonly underyingError?: T

    static readonly missingStartSeperator = new ParseError(
        `Missing start seperator '${FIRST_SLIDE_SEPERATOR}' at the start of the file.`
    )

    static readonly yamlConfigError = (slideNumber: number, underlyingError: YAMLError | ZodError | unknown) =>
        new ParseError(`The YAML config of slide number ${slideNumber} contains an error.`, underlyingError)

    private constructor(message: string, underlyingError?: T) {
        super(message)
        this.name = 'ParseError'
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
