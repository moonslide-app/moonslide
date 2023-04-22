import { CodeMirrorEditor } from './components/CodeMirrorEditor'
import { FilePicker } from './components/FilePicker'
import { PreviewSlides } from './components/PreviewSlides'

function App() {
    return (
        <div className="p-8 md:p-12 max-w-6xl m-auto">
            <h1 className="text-4xl font-semibold mb-8">Feine Editor</h1>
            <FilePicker />
            <div className="grid grid-cols-3 gap-8">
                <CodeMirrorEditor className="col-span-2 h-[600px] max-h-[600px] overflow-y-auto" />
                <PreviewSlides />
            </div>
        </div>
    )
}

export default App
