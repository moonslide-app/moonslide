import { useEditorStore } from '../store'

export function PreviewSlides() {
    const slidesLastUpdate = useEditorStore(state => state.slidesLastUpdate)

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {slidesLastUpdate.map((update, idx) => (
                <div key={idx}>
                    <iframe
                        src={`reveal://preview-small/#/${idx}`}
                        className="w-full h-48 2xl:h-60"
                        key={update}
                    ></iframe>
                </div>
            ))}
        </div>
    )
}
