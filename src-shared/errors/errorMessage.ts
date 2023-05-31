import { isWrappedError } from './WrappedError'

export type ErrorMessage = {
    highLevelMessage: string
    detailedMessage: string | undefined
}

export function getErrorMessage(error: unknown): ErrorMessage {
    let highLevelMessage = 'An unknown error occurred.'
    let detailedMessage: string | undefined = undefined

    if (isWrappedError(error)) {
        highLevelMessage = error.message
        detailedMessage = error.underlyingErrorMessage
    } else if (error instanceof Error) {
        highLevelMessage = error.message
    } else if (typeof error === 'string') {
        highLevelMessage = error
    }

    return { highLevelMessage, detailedMessage }
}
