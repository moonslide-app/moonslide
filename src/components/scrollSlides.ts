import { RefObject, useEffect, useState } from 'react'

export function useScrollSlides(ref: RefObject<HTMLElement>) {
    const [selectedSlide, setSelectedSlide] = useState(0)
    const [selectedSlideNotThere, setSelectedSlideNotThere] = useState(false)

    /**
     * Selects the slide with the given number and scrolls it into the view
     * if it is not already fully displayed.
     */
    function selectSlide(slideNumber: number) {
        setSelectedSlide(slideNumber)
        scrollToSlide(slideNumber)
    }

    function scrollToSlide(slideNumber: number) {
        const currentRef = ref.current
        const child = currentRef?.children.item(slideNumber)
        if (currentRef && child) {
            child.scrollIntoView({ block: 'nearest' })
            setSelectedSlideNotThere(false)
        } else if (!child) {
            setSelectedSlideNotThere(true)
        }
    }

    useEffect(() => {
        scrollToSlide(selectedSlide)
    }, [selectedSlide])

    /**
     * This function should be called, when the slides change.
     * This helps to set focus on a newly generated slide, which
     * appears much later after the call to `selectSlide`.
     */
    function onSlidesChange() {
        if (selectedSlideNotThere) {
            setTimeout(() => scrollToSlide(selectedSlide), 10)
        }
    }

    return { selectedSlide, selectSlide, onSlidesChange }
}
