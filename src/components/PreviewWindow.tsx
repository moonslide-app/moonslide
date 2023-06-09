import { Ref, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useEditorStore } from '../store'

let currentPreviewWindow: Window | undefined
export function openPreviewWindow(title?: string) {
    if (currentPreviewWindow && !currentPreviewWindow.closed) {
        currentPreviewWindow.close()
    }

    currentPreviewWindow = window.open('reveal://preview', undefined, 'width=1280,height=800') ?? undefined

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
    const currentSlideNumber = useRef(0)

    function sendShowSlideMessage(slideNumber: number) {
        const message = {
            name: 'reveal-editor:show-slide',
            slideNumber: slideNumber,
        }
        currentPreviewWindow?.postMessage(message, '*')
    }

    useImperativeHandle(ref, () => ({
        showSlide(slideNumber) {
            currentSlideNumber.current = slideNumber
            sendShowSlideMessage(slideNumber)
        },
    }))

    useEffect(() => {
        if (currentPreviewWindow) {
            const message = {
                name: 'reveal-editor:reload',
            }

            currentPreviewWindow.postMessage(message, '*')
            sendShowSlideMessage(currentSlideNumber.current)
        }
    }, [lastFullUpdate])

    useEffect(() => {
        if (currentPreviewWindow) {
            const message = {
                name: 'reveal-editor:update',
                newSlides: currentSlidesHtml,
            }

            currentPreviewWindow.postMessage(message, '*')
            sendShowSlideMessage(currentSlideNumber.current)
        }
    }, [currentSlidesHtml])

    return <></>
})
