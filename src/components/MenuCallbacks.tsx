import { useEditorStore } from '../store'
import { htmlFilter, markdownFilter } from '../store/FileFilters'
import { openPreviewWindow } from './PreviewWindow'
import { toast } from './ui/use-toast'
import { useEffectOnce } from 'usehooks-ts'

export function MenuCallbacks() {
    const {
        changeEditingFile,
        saveContentToEditingFile,
        saveOrDiscardChanges,
        exportHTMLPresentation,
        reloadAllPreviews,
        editingFile,
        content,
        getContent,
        updateContent,
    } = useEditorStore()

    // If the file does not exist on the system anymore (path is loaded from localstorage)
    // the editor should just display the same content without a file.
    useEffectOnce(() => {
        if (editingFile.path !== undefined) {
            window.ipc.files.existsFile(editingFile.path).then(editingFileExists => {
                if (!editingFileExists) {
                    const currentContent = content
                    changeEditingFile(undefined)
                    updateContent(currentContent)
                }
            })
        }
    })

    async function newPresentation() {
        const filePath = await window.ipc.files.selectOutputFile('New Presentation', [markdownFilter])
        await saveOrDiscardChanges()
        await window.ipc.files.saveFile(filePath, '')
        changeEditingFile(filePath)
    }

    async function open() {
        const filePath = await window.ipc.files.selectFile('Open Presentation', [markdownFilter])
        await saveOrDiscardChanges()
        changeEditingFile(filePath)
    }

    async function save() {
        await saveContentToEditingFile()
    }

    async function saveAs() {
        const filePath = await window.ipc.files.selectOutputFile('Save Presentation', [markdownFilter])
        await window.ipc.files.saveFile(filePath, getContent())
        await changeEditingFile(filePath)
    }

    async function exportPdf() {
        const filePath = await window.ipc.files.selectOutputFile('Export Presentation', [
            { name: 'PDF', extensions: ['pdf'] },
        ])
        await window.ipc.presentation.exportPdf(filePath)
        toast({
            title: 'PDF Export successful',
            description: `The presentation was exported to '${filePath}'.`,
        })
    }

    async function exportPresentationBundle() {
        const folderPath = await window.ipc.files.selectOutputFolder('Export Presentation Bundle')
        await exportHTMLPresentation(folderPath, true)
        toast({
            title: 'HTML Bundle Export successful',
            description: `The presentation was exported to '${folderPath}'.`,
        })
    }

    async function exportPresentationOnly() {
        const filePath = await window.ipc.files.selectOutputFile('Export Presentation Only', [htmlFilter])
        await exportHTMLPresentation(filePath, false)
        toast({
            title: 'HTML Presentation Export successful',
            description: `The presentation was exported to '${filePath}'.`,
        })
    }

    async function createTemplate() {
        const folderPath = await window.ipc.files.selectOutputFolder('Export Template')
        await window.ipc.presentation.exportTemplate(folderPath)
        toast({
            title: 'Standard Template Export successful',
            description: `The standard template was exported to '${folderPath}'. It can now be customized.`,
        })
    }

    async function reloadPreviews() {
        await reloadAllPreviews()
    }

    async function openPreview() {
        openPreviewWindow()
    }

    // it has to be this ugly, so we can capture the errors
    useEffectOnce(() => {
        window.ipc.menu.onNew(() => {
            newPresentation()
        })
        window.ipc.menu.onOpen(() => {
            open()
        })
        window.ipc.menu.onSave(() => {
            save()
        })
        window.ipc.menu.onSaveAs(() => {
            saveAs()
        })
        window.ipc.menu.onExportPdf(() => {
            exportPdf()
        })
        window.ipc.menu.onExportPresentationBundle(() => {
            exportPresentationBundle()
        })
        window.ipc.menu.onExportPresentationOnly(() => {
            exportPresentationOnly()
        })
        window.ipc.menu.onCreateTemplate(() => {
            createTemplate()
        })
        window.ipc.menu.onReloadPreviews(() => {
            reloadPreviews()
        })
        window.ipc.menu.onOpenPreviews(() => {
            openPreview()
        })
    })

    return <></>
}
