import { useEditorStore } from '../store'
import { Frame } from './Frame'

export function PreviewSlides() {
    const slidesLastUpdate = useEditorStore(state => state.slidesLastUpdate)
    const slidesHtml = useEditorStore(state => state.parsedPresentation?.fullHtml)

    return (
        <div className="space-y-4 px-4 h-full overflow-y-auto">
            {slidesLastUpdate.map((update, idx) => (
                <div key={idx}>
                    <Frame content={slidesHtml ?? ''}></Frame>
                </div>
            ))}
        </div>
    )
}
