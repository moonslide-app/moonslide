import { CodeMirrorEditor, CodeMirrorEditorRef } from './components/CodeMirrorEditor'
import { PreviewSlides, PreviewSlidesRef } from './components/PreviewSlides'
import { MenuCallbacks } from './components/MenuCallbacks'
import { useEditorStore } from './store'
import { useEffectOnce } from 'usehooks-ts'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { PreviewWindow, PreviewWindowRef } from './components/PreviewWindow'
import { ErrorAlert } from './components/ErrorAlert'
import { MarkdownToolbar } from './components/MarkdownToolbar'
import { useRef } from 'react'
import { Toaster } from './components/ui/toaster'
import { GlobalErrors } from './components/GlobalErrors'

function App() {
    const [editingFile, reloadAllPreviews] = useEditorStore(state => [state.editingFile, state.reloadAllPreviews])
    const templateConfig = useEditorStore(state => state.parsedPresentation?.templateConfig)

    useEffectOnce(() => {
        reloadAllPreviews()
    })

    const codeEditorRef = useRef<CodeMirrorEditorRef>(null)
    const previewSlidesRef = useRef<PreviewSlidesRef>(null)
    const previewWindowRef = useRef<PreviewWindowRef>(null)

    function showSlide(slideNumber: number) {
        previewSlidesRef.current?.scrollToSlide(slideNumber)
        previewWindowRef.current?.showSlide(slideNumber)
    }

    return (
        <div className="flex flex-col h-screen m-auto">
            <Toaster />
            <GlobalErrors />
            <MenuCallbacks />
            <PreviewWindow ref={previewWindowRef} />
            <p className="text-sm font-medium">Editing File: {editingFile.path}</p>
            <div className="flex-grow">
                <Allotment separator={false}>
                    <Allotment.Pane minSize={300} className="border-r-[1px]" snap>
                        <div className="flex flex-col h-full">
                            <MarkdownToolbar
                                templateConfig={templateConfig}
                                editorRef={codeEditorRef.current ?? undefined}
                            />
                            <CodeMirrorEditor ref={codeEditorRef} onUpdateCurrentSlide={showSlide} />
                        </div>
                    </Allotment.Pane>
                    <Allotment.Pane minSize={300} className="border-l-[1px]" snap>
                        <PreviewSlides
                            ref={previewSlidesRef}
                            clickOnSlide={num => codeEditorRef.current?.onScrollToSlide(num)}
                        />
                    </Allotment.Pane>
                </Allotment>
            </div>
            <ErrorAlert />
        </div>
    )
}

export default App
