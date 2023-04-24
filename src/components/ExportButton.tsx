export function ExportButton() {
    const selectPdfFile = () => window.ipc.files.selectOutputFile({ name: 'PDF', extension: 'pdf' }).then(exportPdf)

    return (
        <div className="space-y-2 mb-4">
            <div>
                <button onClick={selectPdfFile} className="text-violet-500 font-medium">
                    Export PDF
                </button>
            </div>
        </div>
    )
}

function exportPdf(outputPath: string) {
    console.log(`exportPdf outputPath: ${outputPath}`)
    window.ipc.files.exportPdf(outputPath)
}
