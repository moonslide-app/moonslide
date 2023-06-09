import { useEffect, useRef, useState } from 'react'
import { Slide } from '../../src-shared/entities/Presentation'

export function PreviewSlide(props: { slide: Slide; lastFullUpdate?: number; selected?: boolean }) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [previewHtml, setPreviewHtml] = useState(props.slide.previewHtml)

    // Update slide content when markdown content changes.
    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            const message = {
                name: 'reveal-editor:update',
                newSlides: props.slide.slideHtml,
            }

            iframeRef.current.contentWindow.postMessage(message, '*')
        }
    }, [props.slide.markdown])

    // Update src doc when lastFullUpdate changes.
    useEffect(() => {
        setPreviewHtml(props.slide.previewHtml)
    }, [props.lastFullUpdate])

    const className =
        'w-full aspect-[16/9] pointer-events-none min-w-0 rounded-lg ' +
        (props.selected ? 'border-4 border-accent-primary' : 'p-1')

    return <iframe ref={iframeRef} tabIndex={-1} srcDoc={previewHtml} className={className}></iframe>
}
