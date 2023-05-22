import { Presentation } from './Presentation'

export type PresentationStore = {
    parsedPresentation: Presentation | undefined
    templateLastUpdate: number
    themeLastUpdate: number
    slidesLastUpdate: number[]
}
