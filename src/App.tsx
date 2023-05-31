import { CodeMirrorEditor } from './components/CodeMirrorEditor'
import { PreviewSlides } from './components/PreviewSlides'
import { MenuCallbacks } from './components/MenuCallbacks'
import { useEditorStore } from './store'
import { useEffectOnce } from 'usehooks-ts'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { PreviewWindow } from './components/PreviewWindow'
import { ErrorAlert } from './components/ErrorAlert'
import { Toaster } from './components/ui/toaster'
import { GlobalErrors } from './components/GlobalErrors'

function App() {
    const [editingFilePath, reloadAllPreviews] = useEditorStore(state => [
        state.editingFilePath,
        state.reloadAllPreviews,
    ])

    useEffectOnce(() => {
        reloadAllPreviews()
    })

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
                        <CodeMirrorEditor />
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
