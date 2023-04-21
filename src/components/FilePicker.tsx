import { useRef, useState } from 'react'

export function FilePicker() {
    const [markdownFile, setMarkdownFile] = useState<string | undefined>(
        '/Users/timo/Developer/Studium/23_FS/BA/reveal-editor/presentation/presentation.md'
    )
    const [templateFolder, setTemplateFolder] = useState<string | undefined>(
        '/Users/timo/Developer/Studium/23_FS/BA/reveal-editor/presentation/template/'
    )
    const [outputFolder, setOutputFolder] = useState<string>()

    const [previewUrl, setPreviewUrl] = useState<string>()
    const frameRef = useRef<HTMLIFrameElement | null>(null)
    const [testKey, setTestKey] = useState(0)

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
            await window.ipc.presentation.preparePresentation(markdownFile, templateFolder)
            window.open('reveal://presentation/', '_blank')
        }
    }

    const showPreview = async () => {
        if (markdownFile && templateFolder) {
            await window.ipc.presentation.preparePresentation(markdownFile, templateFolder)
            setPreviewUrl('reveal://preview/')
            setTestKey(count => count + 1)
        }
    }

    return (
        <div>
            <button onClick={selectMarkdownFile}>Select Markdown File</button>
            <p>{`Selected Markdown File: ${markdownFile || 'None'}`}</p>
            <button onClick={selectTemplateFolder}>Select Template Folder</button>
            <p>{`Selected Template Folder: ${templateFolder || 'None'}`}</p>
            <button onClick={openInWindow}>Open in new Window</button>
            <button onClick={showPreview}>Show Preview</button>
            <button onClick={selectOutputFolder}>Select Output Folder</button>
            <p>{`Selected Output Folder: ${outputFolder || 'None'}`}</p>
            <button onClick={letsGo}>Let's goo</button>

            {previewUrl && <iframe ref={frameRef} key={testKey} src={previewUrl} width="600" height="300" />}
        </div>
    )
}
