import { Ref, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useEditorStore } from '../store'
import { PreviewSlide } from './PreviewSlide'
import { useScrollSlides } from './scrollSlides'

export type PreviewSlidesRef = {
    scrollToSlide: (slideNumber: number) => void
}

export type PreviewSlidesProps = {
    clickOnSlide?: (slideNumber: number) => void
}

export const PreviewSlides = forwardRef((props: PreviewSlidesProps, ref: Ref<PreviewSlidesRef>) => {
    const lastFullUpdate = useEditorStore(state => state.lastFullUpdate)

    const slides = useEditorStore(state => state.parsedPresentation?.slides)
    const currentPresentationsHtml = slides?.map(slide => slide.previewHtml)
    const [cachedPresentationsHtml, setCachedPresentationsHtml] = useState(currentPresentationsHtml)

    useEffect(() => {
        setCachedPresentationsHtml(currentPresentationsHtml)
    }, [lastFullUpdate])

    useEffect(() => {
        onSlidesChange()
        if (currentPresentationsHtml?.length !== cachedPresentationsHtml?.length) {
            setCachedPresentationsHtml(currentPresentationsHtml)
        }
    }, [slides])

    const slidesDivRef = useRef<HTMLDivElement>(null)
    const { selectedSlide, selectSlide, onSlidesChange } = useScrollSlides(slidesDivRef)

    useImperativeHandle(ref, () => ({
        scrollToSlide(slideNumber) {
            selectSlide(slideNumber)
        },
    }))

    function clickOnSlide(slideNumber: number) {
        selectSlide(slideNumber)
        props.clickOnSlide?.(slideNumber)
    }

    return (
        <div ref={slidesDivRef} className="space-y-3 p-3 h-full overflow-y-auto bg-background" key={lastFullUpdate}>
            {slides &&
                slides.map((slide, idx) => (
                    <button
                        className={
                            'flex w-full focus:outline-none rounded-lg  ' +
                            (idx === selectedSlide
                                ? 'bg-highlight-200'
                                : 'bg-gray-100 focus-visible:bg-highlight-100 hover:bg-highlight-100')
                        }
                        onClick={() => clickOnSlide(idx)}
                    >
                        <div className="flex items-start pt-3">
                            <div className="w-8 flex justify-center">
                                <span
                                    className={
                                        'text-sm font-bold ' +
                                        (idx === selectedSlide ? 'text-highlight-500' : 'text-gray-500')
                                    }
                                >
                                    {idx + 1}
                                </span>
                            </div>
                        </div>
                        <PreviewSlide
                            presentationHtml={(cachedPresentationsHtml && cachedPresentationsHtml[idx]) ?? ''}
                            slideHtml={slide.slideHtml ?? ''}
                            selected={idx === selectedSlide}
                        ></PreviewSlide>
                    </button>
                ))}
        </div>
    )
})
