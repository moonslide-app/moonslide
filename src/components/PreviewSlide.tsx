import { useEffect, useRef } from 'react'

export function PreviewSlide(props: { presentationHtml: string; slideHtml: string; selected?: boolean }) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const slideHtml = useRef(props.slideHtml)

    if (slideHtml.current !== props.slideHtml) {
        slideHtml.current = props.slideHtml
    }

    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            const message = {
                name: 'reveal-editor:update',
                newSlides: slideHtml.current,
            }

            iframeRef.current.contentWindow.postMessage(message, '*')
        }
    }, [slideHtml.current])

    const className =
        'w-full aspect-[16/9] pointer-events-none rounded-lg ' +
        (props.selected ? 'border-4 border-highlight-400' : 'p-1')

    return <iframe ref={iframeRef} tabIndex={-1} srcDoc={props.presentationHtml} className={className}></iframe>
}
