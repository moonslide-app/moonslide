import { useEditorStore } from '../store'

export function PreviewSlides() {
    const content = useEditorStore(state => state.parsedContent)

    return (
        <div>
            {content?.slideNumbers.map(slideNumber => (
                <iframe src={`reveal://preview/#/${slideNumber}`}></iframe>
            ))}
        </div>
    )
}
