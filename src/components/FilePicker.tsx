import { useRef, useState } from 'react'
import { useEditorStore } from '../store/editor'
import { useEventListener } from 'usehooks-ts'
import { useParserStore } from '../store/parser'

export function FilePicker() {
    const [markdownFile, setMarkdownFile] = useEditorStore(state => [state.editingFilePath, state.changeEditingFile])
    const saveFile = useEditorStore(state => state.saveContentToEditingFile)
    const parsedContent = useParserStore(state => state.htmlString)

    const [templateFolder, setTemplateFolder] = useState<string | undefined>(
        '/Users/timo/Developer/Studium/23_FS/BA/reveal-editor/presentation/template/'
    )

    const [previewUrl, setPreviewUrl] = useState<string>()
    const frameRef = useRef<HTMLIFrameElement | null>(null)
    const [testKey, setTestKey] = useState(0)

    const selectMarkdownFile = () => window.ipc.files.selectFile().then(setMarkdownFile)
    const selectTemplateFolder = () => window.ipc.files.selectFolder().then(setTemplateFolder)

    const openInWindow = async () => {
        if (markdownFile && templateFolder) {
            await window.ipc.presentation.preparePresentation(parsedContent(), templateFolder)
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

    useEventListener('keydown', event => {
        const isMac = /Mac/.test(navigator.userAgent)
        const cmdSOnMac = isMac && event.metaKey && event.key === 's'
        const ctrlSOnOther = !isMac && event.ctrlKey && event.key === 's'
        if (cmdSOnMac || ctrlSOnOther) {
            event.preventDefault()
            saveFile()
        }
    })

    return (
        <div>
            <button onClick={selectMarkdownFile}>Select Markdown File</button>
            <p>{`Selected Markdown File: ${markdownFile || 'None'}`}</p>
            <button onClick={selectTemplateFolder}>Select Template Folder</button>
            <p>{`Selected Template Folder: ${templateFolder || 'None'}`}</p>
            <button onClick={openInWindow}>Open in new Window</button>
            <button onClick={showPreview}>Show Preview</button>
            <button onClick={saveFile}>Save File</button>

            {previewUrl && <iframe ref={frameRef} key={testKey} src={previewUrl} width="600" height="300" />}
        </div>
    )
}
