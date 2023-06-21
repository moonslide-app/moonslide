import { Ref, forwardRef, useEffect, useImperativeHandle } from 'react'
import { useEditorStore } from '../store'

let currentPreviewWindow: Window | undefined
let currentSlideNumber: number | undefined
export function openPreviewWindow(title?: string) {
    if (currentPreviewWindow && !currentPreviewWindow.closed) {
        currentPreviewWindow.close()
    }

    const url = `reveal://preview/${currentSlideNumber !== undefined ? '#/' + currentSlideNumber : ''}`
    currentPreviewWindow = window.open(url, undefined, 'width=1280,height=800') ?? undefined

    if (currentPreviewWindow) {
        currentPreviewWindow.document.title = `${title ? title + ' — ' : ''}Moonslide Preview`
    }

    return currentPreviewWindow
}

export type PreviewWindowRef = {
    showSlide: (slideNumber: number) => void
}

export const PreviewWindow = forwardRef((props, ref: Ref<PreviewWindowRef>) => {
    const lastFullUpdate = useEditorStore(state => state.lastFullUpdate)
    const currentSlidesHtml = useEditorStore(state => state.parsedPresentation?.slidesHtml)

    function sendShowSlideMessage(slideNumber: number) {
        const message = {
            name: 'moonslide:show-slide',
            slideNumber: slideNumber,
        }
        currentPreviewWindow?.postMessage(message, '*')
    }

    useImperativeHandle(ref, () => ({
        showSlide(slideNumber) {
            currentSlideNumber = slideNumber
            sendShowSlideMessage(slideNumber)
        },
    }))

    useEffect(() => {
        if (currentPreviewWindow) {
            const message = {
                name: 'moonslide:reload',
            }

            currentPreviewWindow.postMessage(message, '*')
            if (currentSlideNumber !== undefined) sendShowSlideMessage(currentSlideNumber)
        }
    }, [lastFullUpdate])

    useEffect(() => {
        if (currentPreviewWindow) {
            const message = {
                name: 'moonslide:update',
                newSlides: currentSlidesHtml,
            }

            currentPreviewWindow.postMessage(message, '*')
            if (currentSlideNumber !== undefined) sendShowSlideMessage(currentSlideNumber)
        }
    }, [currentSlidesHtml])

    return <></>
})
