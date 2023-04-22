import { CodeMirrorEditor } from './components/CodeMirrorEditor'
import { FilePicker } from './components/FilePicker'
import { PreviewSlides } from './components/PreviewSlides'

function App() {
    return (
        <div>
            <h1>Hello World</h1>
            <FilePicker />
            <CodeMirrorEditor />
            <PreviewSlides />
        </div>
    )
}

export default App
