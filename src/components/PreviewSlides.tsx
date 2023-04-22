import { useEditorStore } from '../store'

export function PreviewSlides() {
    const content = useEditorStore(state => state.parsedContent)

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {content?.slideNumbers.map(slideNumber => (
                <iframe src={`reveal://preview/#/${slideNumber}`} className="w-full h-48"></iframe>
            ))}
        </div>
    )
}
