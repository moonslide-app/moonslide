import { parse } from '../parse'
import { ParseRequest } from '../../src-shared/entities/ParseRequest'
import { Presentation } from '../../src-shared/entities/Presentation'

export type PresentationStore = {
    parsedPresentation: Presentation | undefined
}

export const presentationStore: PresentationStore = {
    parsedPresentation: undefined,
}

export async function parseAndCachePresentation(parseRequest: ParseRequest): Promise<Presentation> {
    return parse(parseRequest).then(parsed => (presentationStore.parsedPresentation = parsed))
}
