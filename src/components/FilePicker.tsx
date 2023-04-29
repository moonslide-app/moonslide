import { useEditorStore } from '../store'
import { useEventListener } from 'usehooks-ts'

export function FilePicker() {
    const { editingFilePath, changeEditingFile, saveContentToEditingFile, reloadAllPreviews } = useEditorStore()

    const selectMarkdownFile = () => window.ipc.files.selectFile().then(changeEditingFile)

    const openInWindow = () => window.ipc.presentation.openPreviewWindow()

    useEventListener('keydown', event => {
        const isMac = /Mac/.test(navigator.userAgent)
        const cmdSOnMac = isMac && event.metaKey && event.key === 's'
        const ctrlSOnOther = !isMac && event.ctrlKey && event.key === 's'
        if (cmdSOnMac || ctrlSOnOther) {
            event.preventDefault()
            saveContentToEditingFile()
        }
    })

    return (
        <div className="space-y-2 mb-4">
            <div className="flex space-x-2 items-baseline">
                <button onClick={selectMarkdownFile} className="text-violet-500 font-medium">
                    Select Markdown File
                </button>
                <span className="text-xs">{`${editingFilePath || 'None'}`}</span>
            </div>

            <div>
                <button onClick={openInWindow} className="text-violet-500 font-medium">
                    Open Presentation Window
                </button>
            </div>

            <div>
                <button onClick={saveContentToEditingFile} className="text-violet-500 font-medium">
                    Save File (cmd + s)
                </button>
            </div>

            <div>
                <button onClick={reloadAllPreviews} className="text-violet-500 font-medium">
                    Reload all previews
                </button>
            </div>
        </div>
    )
}
