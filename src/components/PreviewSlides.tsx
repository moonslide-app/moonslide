import { useEffect, useState } from 'react'
import { useEditorStore } from '../store'
import { PreviewSlide } from './PreviewSlide'

export function PreviewSlides() {
    const templateLastUpdate = useEditorStore(state => state.templateLastUpdate)
    const themeLastUpdate = useEditorStore(state => state.themeLastUpdate)

    const slides = useEditorStore(state => state.parsedPresentation?.slides)
    const currentPresentationsHtml = slides?.map(slide => slide.previewHtml)
    const [cachedPresentationsHtml, setCachedPresentationsHtml] = useState(currentPresentationsHtml)

    useEffect(() => {
        setCachedPresentationsHtml(currentPresentationsHtml)
    }, [templateLastUpdate, themeLastUpdate])

    useEffect(() => {
        if (currentPresentationsHtml?.length !== cachedPresentationsHtml?.length) {
            setCachedPresentationsHtml(currentPresentationsHtml)
        }
    }, [slides])

    return (
        <div className="space-y-4 px-4 h-full overflow-y-auto">
            {slides &&
                slides.map((slide, idx) => (
                    <PreviewSlide
                        presentationHtml={
                            (cachedPresentationsHtml && cachedPresentationsHtml[idx]) ?? 'empty presentation'
                        }
                        slideHtml={slide.contentHtml ?? 'empty slide'}
                    ></PreviewSlide>
                ))}
        </div>
    )
}
