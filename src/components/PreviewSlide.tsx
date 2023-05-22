import { useEffect, useRef } from 'react'

export function PreviewSlide(props: { presentationHtml: string; slideHtml: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const slideHtml = useRef(props.slideHtml)

    if (slideHtml.current !== props.slideHtml) {
        slideHtml.current = props.slideHtml
    }

    console.log('render')

    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            const message = {
                name: 'reveal-editor:update',
                newSlides: slideHtml.current,
            }

            iframeRef.current.contentWindow.postMessage(message, '*')
        }
    }, [slideHtml.current])

    return <iframe ref={iframeRef} srcDoc={props.presentationHtml} className="w-full aspect-[16/9]"></iframe>
}
