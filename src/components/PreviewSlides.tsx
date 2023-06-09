import { Ref, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
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

    const slidesDivRef = useRef<HTMLDivElement>(null)
    const { selectedSlide, selectSlide, onSlidesChange } = useScrollSlides(slidesDivRef)

    // We call this function, when the number of slides change, to correctly focus the new slide.
    useEffect(() => onSlidesChange(), [slides?.length])

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
        <div
            ref={slidesDivRef}
            className="space-y-3 p-3 h-full overflow-y-auto bg-background-primary"
            key={lastFullUpdate}
        >
            {slides &&
                slides.map((slide, idx) => (
                    <button
                        className={
                            'flex w-full focus:outline-none rounded-lg  ' +
                            (idx === selectedSlide
                                ? 'bg-accent-tertiary'
                                : 'bg-background-secondary focus-visible:bg-accent-tertiary hover:bg-accent-tertiary')
                        }
                        onClick={() => clickOnSlide(idx)}
                    >
                        <div className="flex items-start pt-3">
                            <div className="w-8 flex justify-center">
                                <span
                                    className={
                                        'text-sm font-bold ' +
                                        (idx === selectedSlide ? 'text-accent-primary' : 'text-foreground-secondary')
                                    }
                                >
                                    {idx + 1}
                                </span>
                            </div>
                        </div>
                        <PreviewSlide
                            slide={slide}
                            selected={idx === selectedSlide}
                            lastFullUpdate={lastFullUpdate}
                        ></PreviewSlide>
                    </button>
                ))}
        </div>
    )
})
