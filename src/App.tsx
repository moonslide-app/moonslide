import { CodeMirrorEditor } from './components/CodeMirrorEditor'
import { PreviewSlides } from './components/PreviewSlides'
import { MenuCallbacks } from './components/MenuCallbacks'
import { useEditorStore } from './store'
import { useEffectOnce } from 'usehooks-ts'

function App() {
    const [editingFilePath, reloadAllPreviews] = useEditorStore(state => [
        state.editingFilePath,
        state.reloadAllPreviews,
    ])

    useEffectOnce(() => {
        reloadAllPreviews()
    })

    return (
        <div className="p-8 md:p-12 m-auto">
            <MenuCallbacks />
            <h1 className="text-4xl font-semibold mb-4">Reveal Editor</h1>
            <p className="text-sm font-medium">Editing File: {editingFilePath}</p>
            <div className="grid grid-cols-3 2xl:grid-cols-4 gap-8">
                <CodeMirrorEditor className="col-span-2 2xl:col-span-3 h-[700px] max-h-[700px] overflow-y-auto" />
                <PreviewSlides />
            </div>
        </div>
    )
}

export default App
