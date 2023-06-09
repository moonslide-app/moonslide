import { CodeMirrorEditor } from './editor/CodeMirrorEditor'
import { CodeMirrorEditorRef } from './editor/CodeMirrorEditorRef'
import { PreviewSlides, PreviewSlidesRef } from './components/PreviewSlides'
import { MenuCallbacks } from './components/MenuCallbacks'
import { useEditorStore } from './store'
import { useEffectOnce } from 'usehooks-ts'
import { Allotment, AllotmentHandle } from 'allotment'
import 'allotment/dist/style.css'
import { PreviewWindow, PreviewWindowRef, openPreviewWindow } from './components/PreviewWindow'
import { ErrorAlert } from './components/ErrorAlert'
import { MarkdownToolbar } from './components/MarkdownToolbar'
import { Toaster } from './components/ui/toaster'
import { GlobalErrors } from './components/GlobalErrors'
import { Dropzone } from './components/Dropzone'
import { acceptedFileTypes } from '../src-shared/constants/fileTypes'
import { StatusBar } from './components/StatusBar'
import { TitleBar } from './components/TitleBar'
import { useEffect, useRef, useState } from 'react'

function App() {
    const [editingFile, reloadAllPreviews, templateConfig, presentationConfig] = useEditorStore(state => [
        state.editingFile,
        state.reloadAllPreviews,
        state.parsedPresentation?.templateConfig,
        state.parsedPresentation?.config,
    ])
    const [windowTitle, setWindowTitle] = useState('Moonslide')
    const getMediaPath = useEditorStore(state => state.getMediaPath)

    const allotmentRef = useRef<AllotmentHandle>(null)

    const [editorPaneVisible, setEditorPaneVisible] = useState(true)
    const [previewPaneVisible, setPreviewPaneVisible] = useState(true)

    useEffectOnce(() => {
        reloadAllPreviews()
    })

    useEffect(() => {
        setWindowTitle(`${editingFile.filename ? editingFile.filename + ' — ' : ''}Moonslide`)
    }, [editingFile.filename])

    useEffect(() => {
        document.title = windowTitle
    }, [windowTitle])

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

    function restorePanes() {
        setEditorPaneVisible(true)
        setPreviewPaneVisible(true)
        allotmentRef.current?.reset()
    }

    return (
        <div className="flex flex-col h-screen m-auto">
            <Toaster />
            <GlobalErrors />
            <MenuCallbacks />
            <PreviewWindow ref={previewWindowRef} />
            <TitleBar
                windowTitle={windowTitle}
                onUndo={codeEditorRef.current?.onUndo}
                onRedo={codeEditorRef.current?.onRedo}
                onRestorePanes={restorePanes}
                onPanelLeftToggle={() => setEditorPaneVisible(!editorPaneVisible)}
                onPanelRightToggle={() => setPreviewPaneVisible(!previewPaneVisible)}
                onReload={reloadAllPreviews}
                onPresent={() => openPreviewWindow(presentationConfig?.title ?? editingFile.filename)}
            />
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
            <div className="flex-grow">
                <div className="flex flex-col h-full">
                    <Allotment ref={allotmentRef} separator={false} className="flex-grow">
                        <Allotment.Pane
                            minSize={100}
                            className="border-r-[1px] border-background-tertiary"
                            visible={editorPaneVisible}
                        >
                            <div className="flex flex-col h-full">
                                <Dropzone
                                    className="flex-grow overflow-hidden"
                                    accept={{
                                        'image/*': acceptedFileTypes.images.map(extension => `.${extension}`),
                                        'video/*': acceptedFileTypes.videos.map(extension => `.${extension}`),
                                    }}
                                    onFileDropped={addMedia}
                                >
                                    <CodeMirrorEditor
                                        ref={codeEditorRef}
                                        className="h-full"
                                        onUpdateCurrentSlide={showSlide}
                                    />
                                </Dropzone>
                            </div>
                        </Allotment.Pane>
                        <Allotment.Pane
                            minSize={150}
                            className="border-l-[1px] border-background-tertiary"
                            visible={previewPaneVisible}
                        >
                            <PreviewSlides
                                ref={previewSlidesRef}
                                clickOnSlide={num => codeEditorRef.current?.onScrollToSlide(num)}
                            />
                        </Allotment.Pane>
                    </Allotment>
                </div>
            </div>
            <ErrorAlert />
            <StatusBar
                leadingText={editingFile.path}
                action={() => {
                    if (editingFile.path) window.ipc.files.showItemInFolder(editingFile.path)
                }}
            />
        </div>
    )
}

export default App
