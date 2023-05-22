import { useEffect } from 'react'
import { useEditorStore } from '../store'

let currentPreviewWindow: Window | undefined
export function openPreviewWindow() {
    if (currentPreviewWindow && !currentPreviewWindow.closed) return currentPreviewWindow

    currentPreviewWindow = window.open('reveal://preview', undefined, 'width=1280,height=800') ?? undefined
    return currentPreviewWindow
}

export function PreviewWindow() {
    const templateLastUpdate = useEditorStore(state => state.templateLastUpdate)
    const themeLastUpdate = useEditorStore(state => state.themeLastUpdate)

    const currentContentHtml = useEditorStore(state =>
        state.parsedPresentation?.slides.map(slide => slide.contentHtml).join('')
    )

    useEffect(() => {
        if (currentPreviewWindow) {
            const message = {
                name: 'reveal-editor:reload',
            }

            currentPreviewWindow.postMessage(message, '*')
        }
    }, [templateLastUpdate, themeLastUpdate])

    useEffect(() => {
        if (currentPreviewWindow) {
            const message = {
                name: 'reveal-editor:update',
                newSlides: currentContentHtml,
            }

            currentPreviewWindow.postMessage(message, '*')
        }
    }, [currentContentHtml])

    return <></>
}
