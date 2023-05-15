import { useEditorStore } from '../store'
import { useEffect } from 'react'
import { markdownFilter } from '../store/FileFilters'

export function MenuCallbacks() {
    const [changeEditingFile, saveContentToEditingFile] = useEditorStore(state => [
        state.changeEditingFile,
        state.saveContentToEditingFile,
    ])

    useEffect(() => {
        window.ipc.menu.onNew(async () => {
            const filePath = await window.ipc.files.selectOutputFile('New Presentation', [markdownFilter])
            await window.ipc.files.saveFile(filePath, '')
            changeEditingFile(filePath)
        })

        window.ipc.menu.onSave(async () => {
            await saveContentToEditingFile()
        })
    }, [changeEditingFile, saveContentToEditingFile])

    return <></>
}
