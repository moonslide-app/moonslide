import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Presentation, comparePresentations } from '../../src-shared/entities/Presentation'
import { htmlFilter, markdownFilter } from './FileFilters'

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
     * Contains an error, if one occurred during parsing
     */
    parsingError: unknown | undefined
    /**
     * This number represents the timestamp at which the template or theme
     * of the presentation has been last modified.
     */
    lastFullUpdate: number
    /**
     * Changes the editing file path.
     * This will try to read the file from the new path and
     * call `updateContent` with the new file content
     * if `updateContent` is not set to `false`.
     */
    changeEditingFile(newFilePath: string | undefined, updateContent?: boolean): Promise<void>
    /**
     * Updates the content in the store. The newContent is parsed and will
     * result in a debounced call to `parsePresentation` if successful.
     */
    updateContent(newContent: string): void
    /**
     * Parses the current content and calls `updateParsedPresentation` with
     * the parsed presentation if successful.
     */
    parsePresentation(): Promise<void>
    /**
     * Updates the parsed presentation in the store.
     * Depending on the changes, this function will make sure that
     * a full reload is scheduled by updating `lastFullUpdate`.
     */
    updateParsedPresentation(newContent: Presentation | undefined): void
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
const DEBOUNCE_INTERVAL = 350

export const useEditorStore = create<EditorStore>()(
    persist(
        (set, get) => ({
            editingFilePath: undefined,
            templateFolderPath: undefined,
            editingFileSaved: true,
            content: '',
            parsedPresentation: undefined,
            parsingError: undefined,
            lastFullUpdate: 0,
            updateContent: newContent => {
                set(state => ({ ...state, content: newContent, editingFileSaved: false }))
                window.clearTimeout(debounceTimeout)
                debounceTimeout = window.setTimeout(get().parsePresentation, DEBOUNCE_INTERVAL)
            },
            parsePresentation: () => {
                const { content, editingFilePath } = get()
                return window.ipc.presentation
                    .parsePresentation({
                        markdownContent: content,
                        markdownFilePath: editingFilePath ?? '.',
                        imageMode: 'preview',
                    })
                    .then(parsedPresentation => {
                        set(state => ({ ...state, parsingError: undefined }))
                        get().updateParsedPresentation(parsedPresentation)
                    })
                    .catch(parsingError => set(state => ({ ...state, parsingError })))
            },
            updateParsedPresentation: newParsedPresentation => {
                const { parsedPresentation, lastFullUpdate } = get()
                set(state => ({ ...state, parsedPresentation: newParsedPresentation }))

                const newTimestamp = Date.now()
                const comparison = comparePresentations(parsedPresentation, newParsedPresentation)
                const newLastFullUpdate =
                    comparison.templateChange || comparison.themeChange ? newTimestamp : lastFullUpdate
                set(state => ({
                    ...state,
                    lastFullUpdate: newLastFullUpdate,
                }))
            },
            async reloadAllPreviews() {
                await get().parsePresentation()
                set(state => ({ ...state, lastFullUpdate: Date.now() }))
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
        }),
        { name: 'editor-store' }
    )
)
