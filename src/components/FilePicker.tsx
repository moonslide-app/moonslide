import { useState } from 'react'

export function FilePicker() {
    const [markdownFile, setMarkdownFile] = useState<string>()
    const [templateFolder, setTemplateFolder] = useState<string>()
    const [outputFolder, setOutputFolder] = useState<string>()

    const selectMarkdownFile = () => window.ipc.files.selectFile().then(setMarkdownFile)
    const selectTemplateFolder = () => window.ipc.files.selectFolder().then(setTemplateFolder)
    const selectOutputFolder = () => window.ipc.files.selectFolder().then(setOutputFolder)

    return (
        <div>
            <button onClick={selectMarkdownFile}>Select Markdown File</button>
            <p>{`Selected Markdown File: ${markdownFile || 'None'}`}</p>
            <button onClick={selectTemplateFolder}>Select Template Folder</button>
            <p>{`Selected Template Folder: ${templateFolder || 'None'}`}</p>
            <button onClick={selectOutputFolder}>Select Output Folder</button>
            <p>{`Selected Output Folder: ${outputFolder || 'None'}`}</p>
        </div>
    )
}
