import { doNotThrow } from '../../src-shared/entities/utils'
import { useEditorStore } from '../store'
import { htmlFilter, markdownFilter } from '../store/FileFilters'
import { openPreviewWindow } from './PreviewWindow'
import { ToastAction } from './ui/toast'
import { toast } from './ui/use-toast'
import { useEffectOnce } from 'usehooks-ts'

export function MenuCallbacks() {
    const {
        changeEditingFile,
        saveContentToEditingFile,
        saveOrDiscardChanges,
        exportHTMLPresentation,
        reloadAllPreviews,
        parsedPresentation,
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
        const [success, filePath] = await doNotThrow(async () => {
            const filePath = await window.ipc.files.selectOutputFile('New Presentation', [markdownFilter])
            await saveOrDiscardChanges()
            return filePath
        })

        if (success && filePath) {
            await window.ipc.files.saveFile(filePath, '---\n---')
            await changeEditingFile(filePath)
        }
    }

    async function open() {
        const [success, filePath] = await doNotThrow(async () => {
            const filePath = await window.ipc.files.selectFile('Open Presentation', [markdownFilter])
            await saveOrDiscardChanges()
            return filePath
        })

        if (success && filePath) {
            await changeEditingFile(filePath)
        }
    }

    async function save() {
        await saveContentToEditingFile()
    }

    async function saveAs() {
        const [success, filePath] = await doNotThrow(() =>
            window.ipc.files.selectOutputFile('Save Presentation', [markdownFilter])
        )

        if (success && filePath) {
            await window.ipc.files.saveFile(filePath, getContent())
            await changeEditingFile(filePath)
        }
    }

    async function exportPdf() {
        const [success, filePath] = await doNotThrow(() =>
            window.ipc.files.selectOutputFile('Export Presentation', [{ name: 'PDF', extensions: ['pdf'] }])
        )
        if (success && filePath) {
            await window.ipc.presentation.exportPdf(filePath)
            toast({
                title: 'PDF Export successful',
                description: `The presentation was exported to '${filePath}'.`,
                action: (
                    <ToastAction altText="Go to folder" onClick={() => window.ipc.files.showItemInFolder(filePath)}>
                        Open
                    </ToastAction>
                ),
            })
        }
    }

    async function exportPresentationBundle() {
        const [success, folderPath] = await doNotThrow(() =>
            window.ipc.files.selectOutputFolder('Export Presentation Bundle')
        )
        if (success && folderPath) {
            await exportHTMLPresentation(folderPath, true)
            toast({
                title: 'HTML Bundle Export successful',
                description: `The presentation was exported to '${folderPath}'.`,
                action: (
                    <ToastAction altText="Go to folder" onClick={() => window.ipc.files.showItemInFolder(folderPath)}>
                        Open
                    </ToastAction>
                ),
            })
        }
    }

    async function exportPresentationOnly() {
        const [success, filePath] = await doNotThrow(() =>
            window.ipc.files.selectOutputFile('Export Presentation Only', [htmlFilter])
        )
        if (success && filePath) {
            await exportHTMLPresentation(filePath, false)
            toast({
                title: 'HTML Presentation Export successful',
                description: `The presentation was exported to '${filePath}'.`,
                action: (
                    <ToastAction altText="Go to folder" onClick={() => window.ipc.files.showItemInFolder(filePath)}>
                        Show
                    </ToastAction>
                ),
            })
        }
    }

    async function createTemplate() {
        const [success, folderPath] = await doNotThrow(() => window.ipc.files.selectOutputFolder('Export Template'))

        if (success && folderPath) {
            await window.ipc.presentation.exportTemplate(folderPath)
            toast({
                title: 'Standard Template Export successful',
                description: `The standard template was exported to '${folderPath}'. It can now be customized.`,
                action: (
                    <ToastAction altText="Go to folder" onClick={() => window.ipc.files.showItemInFolder(folderPath)}>
                        Open
                    </ToastAction>
                ),
            })
        }
    }

    async function reloadPreviews() {
        await reloadAllPreviews()
    }

    async function openPreview() {
        openPreviewWindow(parsedPresentation?.config.title ?? editingFile.filename)
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
