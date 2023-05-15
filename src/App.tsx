import { CodeMirrorEditor } from './components/CodeMirrorEditor'
import { ExportButton } from './components/ExportButton'
import { PreviewSlides } from './components/PreviewSlides'
import { MenuCallbacks } from './components/MenuCallbacks'

function App() {
    return (
        <div className="p-8 md:p-12 m-auto">
            <MenuCallbacks />
            <h1 className="text-4xl font-semibold mb-8">Reveal Editor</h1>
            <ExportButton />
            <div className="grid grid-cols-3 2xl:grid-cols-4 gap-8">
                <CodeMirrorEditor className="col-span-2 2xl:col-span-3 h-[600px] max-h-[600px] overflow-y-auto" />
                <PreviewSlides />
            </div>
        </div>
    )
}

export default App
