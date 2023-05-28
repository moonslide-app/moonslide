import { useEditorStore } from '../store'
import { useEffect } from 'react'
import { markdownFilter } from '../store/FileFilters'
import { openPreviewWindow } from './PreviewWindow'

export function MenuCallbacks() {
    const [
        changeEditingFile,
        saveContentToEditingFile,
        saveOrDiscardChanges,
        exportHTMLPresentation,
        reloadAllPreviews,
        parsingError,
    ] = useEditorStore(state => [
        state.changeEditingFile,
        state.saveContentToEditingFile,
        state.saveOrDiscardChanges,
        state.exportHTMLPresentation,
        state.reloadAllPreviews,
        state.parsingError,
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
            changeEditingFile(undefined) // TODO: workaround if same file is opened, improve this
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
            if (parsingError !== undefined) {
                // TODO: Show toast
                console.warn('Cannot export pdf when there are still parsing errors.')
                return
            }

            const filePath = await window.ipc.files.selectOutputFile('Export Presentation', [
                { name: 'PDF', extensions: ['pdf'] },
            ])

            // TODO: Catch errors and show toast
            await window.ipc.presentation.exportPdf(filePath)
        })

        window.ipc.menu.onExportPresentationBundle(() => {
            if (parsingError !== undefined) {
                // TODO: Show toast
                console.warn('Cannot export presentation when there are still parsing errors.')
                return
            }
            // TODO: Catch errors and show toast
            exportHTMLPresentation(true)
        })
        window.ipc.menu.onExportPresentationOnly(() => {
            if (parsingError !== undefined) {
                // TODO: Show toast
                console.warn('Cannot export presentation when there are still parsing errors.')
                return
            }
            // TODO: Catch errors and show toast
            exportHTMLPresentation(false)
        })
        window.ipc.menu.onReloadPreviews(reloadAllPreviews)
        window.ipc.menu.onOpenPreviews(openPreviewWindow)
    }, [changeEditingFile, saveContentToEditingFile, saveOrDiscardChanges])

    return <></>
}
