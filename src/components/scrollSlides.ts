import { RefObject, useEffect, useState } from 'react'

export function useScrollSlides(ref: RefObject<HTMLElement>) {
    const [selectedSlide, setSelectedSlide] = useState(0)

    function selectSlide(slideNumber: number, scrollCenter?: boolean) {
        setSelectedSlide(slideNumber)
        scrollToSlide(slideNumber, scrollCenter)
    }

    function scrollToSlide(slideNumber: number, scrollCenter?: boolean) {
        const currentRef = ref.current
        const child = currentRef?.children.item(slideNumber)
        if (currentRef && child) {
            if (scrollCenter) {
                child.scrollIntoView({ block: 'center' })
            } else {
                child.scrollIntoView({ block: 'nearest' })
            }
        }
    }

    useEffect(() => {
        scrollToSlide(selectedSlide)
    }, [selectedSlide])

    return { selectedSlide, selectSlide }
}
