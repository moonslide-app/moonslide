import { useEditorStore } from '../store'

export function PreviewSlides() {
    const content = useEditorStore(state => state.parsedContent)
    const lastUpdate = useEditorStore(state => state.lastUpdateOfPresentationFiles)

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto" key={lastUpdate}>
            {content?.slides.map((_, idx) => (
                <iframe src={`reveal://preview/#/${idx}`} className="w-full h-48"></iframe>
            ))}
        </div>
    )
}
