import { useState } from 'react'

export function FilePicker() {
    const [markdownFile, setMarkdownFile] = useState<string>()
    const [templateFolder, setTemplateFolder] = useState<string>()
    const [outputFolder, setOutputFolder] = useState<string>()

    const selectMarkdownFile = () => window.ipc.files.selectFile().then(setMarkdownFile)
    const selectTemplateFolder = () => window.ipc.files.selectFolder().then(setTemplateFolder)
    const selectOutputFolder = () => window.ipc.files.selectFolder().then(setOutputFolder)
    const letsGo = () =>
        markdownFile &&
        templateFolder &&
        outputFolder &&
        window.ipc.presentation.exportPresentation(markdownFile, templateFolder, outputFolder)

    const openInWindow = async () => {
        if (markdownFile && templateFolder) {
            const path = await window.ipc.presentation.movePresentation(markdownFile, templateFolder)
            console.log(`Now we should open a new tab and show the file: ${path}`)
            window.open(`file://${path}`, '_blank')
        }
    }

    return (
        <div>
            <button onClick={selectMarkdownFile}>Select Markdown File</button>
            <p>{`Selected Markdown File: ${markdownFile || 'None'}`}</p>
            <button onClick={selectTemplateFolder}>Select Template Folder</button>
            <p>{`Selected Template Folder: ${templateFolder || 'None'}`}</p>
            <button onClick={openInWindow}>Open in new Window</button>
            <button onClick={selectOutputFolder}>Select Output Folder</button>
            <p>{`Selected Output Folder: ${outputFolder || 'None'}`}</p>
            <button onClick={letsGo}>Let's goo</button>
        </div>
    )
}
