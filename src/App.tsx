function App() {
    const openFilePicker = () => window.ipc.files.selectMarkdownFile().then(res => console.log(res))

    return (
        <div>
            <h1>Hello World</h1>
            <button onClick={openFilePicker}>Open File Picker</button>
        </div>
    )
}

export default App
