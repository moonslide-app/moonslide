import { LocalImage } from '../../src-main/presentation/parseMarkdown'
import { PresentationConfig } from './PresentationConfig'
import { SlideConfig } from './SlideConfig'

export type Presentation = {
    /**
     * The parsed config of the presentation.
     */
    config: PresentationConfig
    /**
     * The slides which are present in the presentation
     */
    slides: Slide[]
    /**
     * The parsed html content of the whole presentation
     */
    html: string
    resolvedPaths: {
        /**
         * The absolute path of this presentations template folder
         */
        templateFolder: string
        /**
         * The resolved absolute path of this presentations markdown file
         */
        markdownFile: string | undefined
    }
    /**
     * All local image files referenced in the presentation
     */
    images: LocalImage[]
    /**
     * Layouts of this presentations template.
     * The key is the name of the layout,
     * the value the html content of the layout.
     */
    layoutsHtml: Record<string, string>
}

export type Slide = {
    /**
     * The parsed config of the slide.
     */
    config: SlideConfig
    /**
     * The original markdown content of the slide.
     */
    markdown: string
    /**
     * The parsed html content of the slide
     */
    html: string
}

export type PresentationComparison = {
    templateChange: boolean
    slideChanges: boolean[]
}

export function comparePresentations(
    lastVersion: Presentation | undefined,
    newVersion: Presentation | undefined
): PresentationComparison {
    const templateChange = lastVersion?.resolvedPaths.templateFolder !== newVersion?.resolvedPaths.templateFolder
    const slideChanges =
        newVersion?.slides.map((slide, idx) => {
            if (templateChange) return true
            const lastVersionSlide = lastVersion?.slides[idx]
            return lastVersionSlide?.html !== slide.html
        }) ?? []
    return { templateChange, slideChanges }
}
