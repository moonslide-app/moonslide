import { useEditorStore } from '../store'
import { useEffect } from 'react'
import { htmlFilter, markdownFilter } from '../store/FileFilters'
import { openPreviewWindow } from './PreviewWindow'
import { toast } from './ui/use-toast'
import { useEffectOnce } from 'usehooks-ts'

export function MenuCallbacks() {
    const [
        changeEditingFile,
        saveContentToEditingFile,
        saveOrDiscardChanges,
        exportHTMLPresentation,
        reloadAllPreviews,
        editingFilePath,
    ] = useEditorStore(state => [
        state.changeEditingFile,
        state.saveContentToEditingFile,
        state.saveOrDiscardChanges,
        state.exportHTMLPresentation,
        state.reloadAllPreviews,
        state.editingFilePath,
    ])

    useEffectOnce(() => {
        if (editingFilePath !== undefined) {
            window.ipc.files.existsFile(editingFilePath).then(editingFileExists => {
                if (!editingFileExists) changeEditingFile(undefined, false)
            })
        }
    })

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
            const filePath = await window.ipc.files.selectOutputFile('Export Presentation', [
                { name: 'PDF', extensions: ['pdf'] },
            ])
            await window.ipc.presentation.exportPdf(filePath)
            toast({
                title: 'PDF Export successful',
                description: `The presentation was exported to '${filePath}'.`,
            })
        })

        window.ipc.menu.onExportPresentationBundle(async () => {
            const folderPath = await window.ipc.files.selectOutputFolder('Export Presentation Bundle')
            await exportHTMLPresentation(folderPath, true)
            toast({
                title: 'HTML Bundle Export successful',
                description: `The presentation was exported to '${folderPath}'.`,
            })
        })
        window.ipc.menu.onExportPresentationOnly(async () => {
            const filePath = await window.ipc.files.selectOutputFile('Export Presentation Only', [htmlFilter])
            await exportHTMLPresentation(filePath, false)
            toast({
                title: 'HTML Presentation Export successful',
                description: `The presentation was exported to '${filePath}'.`,
            })
        })

        window.ipc.menu.onCreateTemplate(async () => {
            const folderPath = await window.ipc.files.selectOutputFolder('Export Template')
            await window.ipc.presentation.exportTemplate(folderPath)
            toast({
                title: 'Standard Template Export successful',
                description: `The standard template was exported to '${folderPath}'. It can now be customized.`,
            })
        })

        window.ipc.menu.onReloadPreviews(reloadAllPreviews)
        window.ipc.menu.onOpenPreviews(openPreviewWindow)
    }, [changeEditingFile, saveContentToEditingFile, saveOrDiscardChanges])

    return <></>
}
