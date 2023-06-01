import { RefObject, useEffect, useState } from 'react'

export function useScrollSlides(ref: RefObject<HTMLElement>) {
    const [selectedSlide, setSelectedSlide] = useState(0)

    function scrollToSlide(slideNumber: number) {
        const currentRef = ref.current
        const child = currentRef?.children.item(slideNumber)
        if (currentRef && child) {
            child.scrollIntoView({ block: 'nearest' })
            // currentRef.scroll({ top: currentRef.scrollTop - 10 })
        }
    }

    useEffect(() => {
        scrollToSlide(selectedSlide)
    }, [selectedSlide])

    return { selectedSlide, setSelectedSlide, scrollToSlide }
}
