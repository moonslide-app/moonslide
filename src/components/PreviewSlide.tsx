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
            console.log('reload ')
            const slidesContainer = iframeRef.current.contentWindow.document.getElementById('slides')
            const newSlides = createSlideContents(slideHtml.current)

            if (slidesContainer) {
                removeAllChildren(slidesContainer)
                slidesContainer.appendChild(newSlides)
            }

            //if (iframeRef.current.contentWindow.Reveal) iframeRef.current.contentWindow.Reveal.slide(0, 0, 0)
            iframeRef.current.contentWindow.postMessage('reveal:reload')
        }
    }, [slideHtml.current])

    return <iframe ref={iframeRef} srcDoc={props.presentationHtml} className="w-full aspect-[16/9]"></iframe>
}

function removeAllChildren(htmlElement: HTMLElement) {
    while (htmlElement.firstChild) htmlElement.firstChild?.remove()
}

function createSlideContents(htmlString: string) {
    const template = document.createElement('template')
    template.innerHTML = htmlString

    // Add `present` class such that contents of section are displayed
    const section = template.content.querySelector('section')
    section?.classList.add('present')

    return template.content
}
