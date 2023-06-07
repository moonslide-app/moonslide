import { CodeMirrorEditor } from './editor/CodeMirrorEditor'
import { CodeMirrorEditorRef } from './editor/CodeMirrorEditorRef'
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
import { Dropzone } from './components/Dropzone'
import { acceptedFileTypes } from '../src-shared/constants/fileTypes'
import { StatusBar } from './components/StatusBar'

function App() {
    const [editingFile, reloadAllPreviews] = useEditorStore(state => [state.editingFile, state.reloadAllPreviews])
    const templateConfig = useEditorStore(state => state.parsedPresentation?.templateConfig)
    const getMediaPath = useEditorStore(state => state.getMediaPath)

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

    async function addMedia(path: string) {
        const mediaPath = await getMediaPath(path)
        codeEditorRef.current?.onAddMedia(mediaPath)
    }

    return (
        <div className="flex flex-col h-screen m-auto">
            <Toaster />
            <GlobalErrors />
            <MenuCallbacks />
            <PreviewWindow ref={previewWindowRef} />
            <div className="flex-grow">
                <div className="flex flex-col h-full">
                    <MarkdownToolbar
                        templateConfig={templateConfig}
                        editorRef={
                            codeEditorRef.current
                                ? {
                                      ...codeEditorRef.current,
                                      onAddMedia: addMedia,
                                  }
                                : undefined
                        }
                    />
                    <Allotment separator={false} className="flex-grow">
                        <Allotment.Pane minSize={300} className="border-r-[1px]" snap>
                            <Dropzone
                                className="h-full"
                                accept={{
                                    'image/*': acceptedFileTypes.images,
                                    'video/*': acceptedFileTypes.videos,
                                }}
                                onFileDropped={addMedia}
                            >
                                <CodeMirrorEditor
                                    ref={codeEditorRef}
                                    className="h-full"
                                    onUpdateCurrentSlide={showSlide}
                                />
                            </Dropzone>
                        </Allotment.Pane>
                        <Allotment.Pane minSize={300} className="border-l-[1px]" snap>
                            <PreviewSlides
                                ref={previewSlidesRef}
                                clickOnSlide={num => codeEditorRef.current?.onScrollToSlide(num)}
                            />
                        </Allotment.Pane>
                    </Allotment>
                </div>
            </div>
            <ErrorAlert />
            <StatusBar leadingText={editingFile.path} />
        </div>
    )
}

export default App
