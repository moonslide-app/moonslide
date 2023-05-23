import { useEffect } from 'react'
import { useEditorStore } from '../store'

let currentPreviewWindow: Window | undefined
export function openPreviewWindow() {
    if (currentPreviewWindow && !currentPreviewWindow.closed) return currentPreviewWindow

    currentPreviewWindow = window.open('reveal://preview', undefined, 'width=1280,height=800') ?? undefined
    return currentPreviewWindow
}

export function PreviewWindow() {
    const lastFullUpdate = useEditorStore(state => state.lastFullUpdate)

    const currentContentHtml = useEditorStore(state => state.parsedPresentation?.contentHtml)

    useEffect(() => {
        if (currentPreviewWindow) {
            const message = {
                name: 'reveal-editor:reload',
            }

            currentPreviewWindow.postMessage(message, '*')
        }
    }, [lastFullUpdate])

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
