import { useEditorStore } from '../store'

export function ExportButton() {
    const exportToPath = () =>
        window.ipc.files.selectOutputFile([{ name: 'PDF', extensions: ['pdf'] }]).then(async path => {
            if (path) {
                console.log(`exportPdf outputPath: ${path}`)
                const outputPath = await window.ipc.presentation.exportPdf(path)
                console.log(`Exported PDF to ${outputPath}`)
            }
        })

    const exportPresentation = useEditorStore(state => state.exportHTMLPresentation)

    return (
        <div className="space-y-2 mb-4">
            <div>
                <button onClick={exportToPath} className="text-violet-500 font-medium">
                    Export PDF
                </button>
            </div>
            <div>
                <button onClick={() => exportPresentation(true)} className="text-violet-500 font-medium">
                    Export Standalone HTML Presentation
                </button>
            </div>
            <div>
                <button onClick={() => exportPresentation(false)} className="text-violet-500 font-medium">
                    Export HTML Presentation only
                </button>
            </div>
        </div>
    )
}
