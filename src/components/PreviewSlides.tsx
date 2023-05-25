import { useEffect, useState } from 'react'
import { useEditorStore } from '../store'
import { PreviewSlide } from './PreviewSlide'

export function PreviewSlides() {
    const lastFullUpdate = useEditorStore(state => state.lastFullUpdate)

    const slides = useEditorStore(state => state.parsedPresentation?.slides)
    const currentPresentationsHtml = slides?.map(slide => slide.previewHtml)
    const [cachedPresentationsHtml, setCachedPresentationsHtml] = useState(currentPresentationsHtml)

    useEffect(() => {
        setCachedPresentationsHtml(currentPresentationsHtml)
    }, [lastFullUpdate])

    useEffect(() => {
        if (currentPresentationsHtml?.length !== cachedPresentationsHtml?.length) {
            setCachedPresentationsHtml(currentPresentationsHtml)
        }
    }, [slides])

    return (
        <div className="space-y-4 p-4 h-full overflow-y-auto bg-gray-100" key={lastFullUpdate}>
            {slides &&
                slides.map((slide, idx) => (
                    <PreviewSlide
                        presentationHtml={(cachedPresentationsHtml && cachedPresentationsHtml[idx]) ?? ''}
                        slideHtml={slide.contentHtml ?? ''}
                    ></PreviewSlide>
                ))}
        </div>
    )
}
