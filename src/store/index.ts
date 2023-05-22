import { create } from 'zustand'
import { Presentation } from '../../src-shared/entities/Presentation'
import { htmlFilter, markdownFilter } from './FileFilters'
import { PresentationStore } from '../../src-shared/entities/PresentationStore'

export type EditorStore = {
    /**
     * The absolute path of the current editing markdown file.
     */
    editingFilePath: string | undefined
    /**
     * The file contents of the editing markdown file.
     */
    content: string
    /**
     * Indicates wheter the latest content has been saved to the editing file.
     */
    editingFileSaved: boolean
    /**
     * The presentation, which was parsed from the `content`.
     */
    parsedPresentation: Presentation | undefined
    /**
     * This number represents the timestamp at which the template of the
     * presentation has been last modified.
     */
    templateLastUpdate: number
    /**
     * This number represents the timestamp at which the theme of the
     * presentation has been last modified.
     */
    themeLastUpdate: number
    /**
     * This array contains a number for every slide currently present
     * in the `parsedPresentation`. The number represents the timestamp
     * when the slide was last updated.
     */
    slidesLastUpdate: number[]
    /**
     * Changes the editing file path.
     * This will try to read the file from the new path and
     * call `updateContent` with the new file content
     * if `updateContent` is not set to `false`.
     */
    changeEditingFile(newFilePath: string | undefined, updateContent?: boolean): Promise<void>
    /**
     * Updates the content in the store. The newContent is parsed and will
     * result in a call to `updateParsedPresentation` if successful.
     */
    updateContent(newContent: string): Promise<void>
    /**
     * Updates the parsed presentation in the store.
     * This will also update the `slidesLastUpdate`.
     * Depending on the changes, this function will make sure that
     * the presentation (and template) files are updated by calling the
     * appropriate ipc functions in the backend.
     */
    updateParsedPresentation(newContent: PresentationStore): Promise<void>
    /**
     * This function triggers a reload of all previews, the small ones and the preview window.
     * This can be useful if files in the template have been changed.
     */
    reloadAllPreviews(): Promise<void>
    /**
     * The `content` is saved to the file at `editingFilePath`.
     */
    saveContentToEditingFile(): Promise<void>
    /**
     * Asks the user, if they want to save the changes or discard it.
     */
    saveOrDiscardChanges(): Promise<void>
    /**
     * Exports the presentation as html.
     * @param standalone If `true` the whole template folder is copied with the presentation.
     */
    exportHTMLPresentation(standalone?: boolean): Promise<void>
}

let debounceTimeout: number | undefined = undefined
const DEBOUNCE_INTERVAL = 100

export const useEditorStore = create<EditorStore>()((set, get) => ({
    editingFilePath: undefined,
    templateFolderPath: undefined,
    editingFileSaved: true,
    content: '',
    parsedPresentation: undefined,
    templateLastUpdate: 0,
    themeLastUpdate: 0,
    slidesLastUpdate: [],
    updateContent: async newContent => {
        const { editingFilePath } = get()
        set(state => ({ ...state, content: newContent, editingFileSaved: false }))

        window.clearTimeout(debounceTimeout)
        debounceTimeout = window.setTimeout(() => {
            window.ipc.presentation
                .parsePresentation({
                    markdownContent: newContent,
                    markdownFilePath: editingFilePath ?? '.',
                    imageMode: 'preview',
                })
                .then(get().updateParsedPresentation)
                .catch(error => console.warn(error))
        }, DEBOUNCE_INTERVAL)
    },
    updateParsedPresentation: async newStore => {
        if (newStore) {
            window.ipc.presentation.reloadPreviewWindow()
        }

        set(state => ({
            ...state,
            parsedPresentation: newStore.parsedPresentation,
            templateLastUpdate: newStore.templateLastUpdate,
            themeLastUpdate: newStore.themeLastUpdate,
            slidesLastUpdate: newStore.slidesLastUpdate,
        }))
    },
    async reloadAllPreviews() {
        set(state => ({ slidesLastUpdate: state.slidesLastUpdate.map(() => Date.now()) }))
        await window.ipc.presentation.reloadPreviewWindow()
    },
    async changeEditingFile(newFilePath, updateContent = true) {
        if (updateContent) {
            if (newFilePath !== undefined) {
                const fileContent = await window.ipc.files.getFileContent(newFilePath)
                await get().updateContent(fileContent)
            } else {
                await get().updateContent('')
            }
        }
        set(state => ({ ...state, editingFilePath: newFilePath, editingFileSaved: true }))
    },
    async saveContentToEditingFile() {
        const { editingFilePath, content } = get()
        if (editingFilePath) {
            await window.ipc.files.saveFile(editingFilePath, content)
            set(state => ({ ...state, editingFileSaved: true }))
        } else {
            const filePath = await window.ipc.files.selectOutputFile('Save new presentation', [markdownFilter])
            await window.ipc.files.saveFile(filePath, content)
            await get().changeEditingFile(filePath)
        }
    },
    async saveOrDiscardChanges() {
        const { content, editingFileSaved, saveContentToEditingFile } = get()
        if (!editingFileSaved && content.trim()) {
            const saveFile = await window.ipc.files.showSaveChangesDialog()
            if (saveFile) await saveContentToEditingFile()
        }
    },
    async exportHTMLPresentation(standalone = true) {
        const { editingFilePath, content } = get()
        if (editingFilePath) {
            const outputPath = await (standalone
                ? window.ipc.files.selectOutputFolder('Export Presentation Bundle')
                : window.ipc.files.selectOutputFile('Export Presentation Only', [htmlFilter]))

            if (outputPath) {
                await window.ipc.presentation.exportHtml({
                    markdownContent: content,
                    markdownFilePath: editingFilePath,
                    outputPath,
                    mode: standalone ? 'export-standalone' : 'export-relative',
                })
            }
        }
    },
}))
