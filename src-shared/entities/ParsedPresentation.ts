import { PresentationConfig } from './PresentationConfig'
import { SlideConfig } from './SlideConfig'

export type ParsedSlide = {
    config: SlideConfig
    markdown: string
    html: string
}

export type ParsedPresentation = {
    config: PresentationConfig
    slides: ParsedSlide[]
    htmlString: string
}
