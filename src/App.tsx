import { CodeMirrorEditor, CodeMirrorEditorRef } from './components/CodeMirrorEditor'
import { PreviewSlides } from './components/PreviewSlides'
import { MenuCallbacks } from './components/MenuCallbacks'
import { useEditorStore } from './store'
import { useEffectOnce } from 'usehooks-ts'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { PreviewWindow } from './components/PreviewWindow'
import { ErrorAlert } from './components/ErrorAlert'
import { MarkdownToolbar } from './components/MarkdownToolbar'
import { useRef } from 'react'
import { Toaster } from './components/ui/toaster'
import { GlobalErrors } from './components/GlobalErrors'

function App() {
    const [editingFilePath, reloadAllPreviews] = useEditorStore(state => [
        state.editingFilePath,
        state.reloadAllPreviews,
    ])
    const templateConfig = useEditorStore(state => state.parsedPresentation?.templateConfig)

    useEffectOnce(() => {
        reloadAllPreviews()
    })

    const codeEditorRef = useRef<CodeMirrorEditorRef>(null)

    return (
        <div className="flex flex-col h-screen m-auto">
            <Toaster />
            <GlobalErrors />
            <MenuCallbacks />
            <PreviewWindow />
            <p className="text-sm font-medium">Editing File: {editingFilePath}</p>
            <div className="flex-grow">
                <Allotment separator={false}>
                    <Allotment.Pane minSize={300} className="border-r-[1px]" snap>
                        <div className="flex flex-col h-full">
                            <MarkdownToolbar
                                templateConfig={templateConfig}
                                editorRef={codeEditorRef.current ?? undefined}
                            />
                            <CodeMirrorEditor ref={codeEditorRef} />
                        </div>
                    </Allotment.Pane>
                    <Allotment.Pane minSize={300} className="border-l-[1px]" snap>
                        <PreviewSlides />
                    </Allotment.Pane>
                </Allotment>
            </div>
            <ErrorAlert />
        </div>
    )
}

export default App
