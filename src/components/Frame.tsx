import { useEffect, useRef, useState } from 'react'

export function Frame(props: { content: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [content, setContent] = useState(props.content)

    if (content !== props.content) {
        setContent(props.content)
    }

    useEffect(() => {
        console.log('use effect called')
        if (iframeRef.current?.contentWindow) {
            console.log('updating document text content')
            console.log(props.content)
            iframeRef.current.contentWindow.document.open()
            iframeRef.current.contentWindow.document.write(props.content)
            iframeRef.current.contentWindow.document.close()
        } else {
            console.log('content window was null')
        }
    }, [content])

    return <iframe ref={iframeRef}></iframe>
}
