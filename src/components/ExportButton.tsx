export function ExportButton() {
    const exportToPath = () =>
        window.ipc.files.selectOutputFile({ name: 'PDF', extension: 'pdf' }).then(async path => {
            if (path) {
                console.log(`exportPdf outputPath: ${path}`)
                const outputPath = await window.ipc.files.exportPdf(path)
                console.log(`Exported PDF to ${outputPath}`)
            }
        })

    return (
        <div className="space-y-2 mb-4">
            <div>
                <button onClick={exportToPath} className="text-violet-500 font-medium">
                    Export PDF
                </button>
            </div>
        </div>
    )
}
