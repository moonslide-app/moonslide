import { useEditorStore } from '../store'
import { useEffect } from 'react'
import { markdownFilter } from '../store/FileFilters'

export function MenuCallbacks() {
    const [
        changeEditingFile,
        saveContentToEditingFile,
        saveOrDiscardChanges,
        exportHTMLPresentation,
        reloadAllPreviews,
    ] = useEditorStore(state => [
        state.changeEditingFile,
        state.saveContentToEditingFile,
        state.saveOrDiscardChanges,
        state.exportHTMLPresentation,
        state.reloadAllPreviews,
    ])

    useEffect(() => {
        window.ipc.menu.onNew(async () => {
            const filePath = await window.ipc.files.selectOutputFile('New Presentation', [markdownFilter])
            await saveOrDiscardChanges()
            await window.ipc.files.saveFile(filePath, '')
            changeEditingFile(filePath)
        })

        window.ipc.menu.onOpen(async () => {
            const filePath = await window.ipc.files.selectFile('Open Presentation', [markdownFilter])
            await saveOrDiscardChanges()
            changeEditingFile(filePath)
        })

        window.ipc.menu.onSave(async () => {
            await saveContentToEditingFile()
        })

        window.ipc.menu.onSaveAs(async () => {
            const filePath = await window.ipc.files.selectOutputFile('Save Presentation', [markdownFilter])
            await changeEditingFile(filePath, false)
            await saveContentToEditingFile()
        })

        window.ipc.menu.onExportPdf(async () => {
            const filePath = await window.ipc.files.selectOutputFile('Export Presentation', [
                { name: 'PDF', extensions: ['pdf'] },
            ])
            await window.ipc.presentation.exportPdf(filePath)
        })

        window.ipc.menu.onExportPresentationBundle(() => exportHTMLPresentation(true))
        window.ipc.menu.onExportPresentationOnly(() => exportHTMLPresentation(false))
        window.ipc.menu.onReloadPreviews(reloadAllPreviews)
    }, [changeEditingFile, saveContentToEditingFile, saveOrDiscardChanges])

    return <></>
}
