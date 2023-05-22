import { Presentation } from '../../src-shared/entities/Presentation'

export type PresentationStore = {
    parsedPresentation: Presentation | undefined
}

export const presentationStore: PresentationStore = {
    parsedPresentation: undefined,
}
