import { isWrappedError } from './WrappedError'

export type ErrorMessage = {
    title: string
    highLevelMessage: string
    detailedMessage: string | undefined
}

export function getErrorMessage(error: unknown): ErrorMessage {
    let title = 'Error'
    let highLevelMessage = 'An unknown error occurred.'
    let detailedMessage: string | undefined = undefined

    if (isWrappedError(error)) {
        title = error.title
        highLevelMessage = error.message
        detailedMessage = error.underlyingErrorMessage
    } else if (error instanceof Error) {
        title = error.name
        highLevelMessage = error.message
    } else if (typeof error === 'string') {
        highLevelMessage = error
    }

    return { title, highLevelMessage, detailedMessage }
}
