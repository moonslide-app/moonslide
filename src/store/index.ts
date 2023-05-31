import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Presentation, comparePresentations } from '../../src-shared/entities/Presentation'
import { markdownFilter } from './FileFilters'

export type EditingFile = {
    /**
     * The absolute path of the file.
     */
    path: string | undefined
    /**
     * Time stamp when the editing file was opened.
     */
    openedAt: number
    /**
     * Contains the content at the state when the last save occured.
     */
    lastSavedContent: string
}

export type EditorStore = {
    /**
     * The current editing markdown file.
     */
    editingFile: EditingFile
    /**
     * The file contents of the editing markdown file.
     */
    content: string
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
     * call `updateContent` with the new file content.
     */
    changeEditingFile(newFilePath: string | undefined): Promise<void>
    /**
     * Updates the content in the store. The newContent is parsed and will
     * result in a debounced call to `parsePresentation` if successful.
     */
    updateContent(newContent: string): void
    /**
     * Returns the current content.
     */
    getContent(): string
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
     * @param outputPath The path where the presentation should be exported to.
     * @param standalone If `true` the whole template folder is copied with the presentation.
     */
    exportHTMLPresentation(outputPath: string, standalone?: boolean): Promise<void>
}

let debounceTimeout: number | undefined = undefined
const DEBOUNCE_INTERVAL = 350

export const useEditorStore = create<EditorStore>()(
    persist(
        (set, get) => ({
            editingFile: {
                path: undefined,
                lastSavedContent: '',
                openedAt: Date.now(),
            },
            content: '',
            getContent: () => get().content,
            parsedPresentation: undefined,
            parsingError: undefined,
            lastFullUpdate: 0,
            updateContent: newContent => {
                set(state => ({ ...state, content: newContent, editingFileSaved: false }))
                window.clearTimeout(debounceTimeout)
                debounceTimeout = window.setTimeout(get().parsePresentation, DEBOUNCE_INTERVAL)
            },
            parsePresentation: () => {
                const { content, editingFile } = get()
                return window.ipc.presentation
                    .parsePresentation({
                        markdownContent: content,
                        markdownFilePath: editingFile.path ?? '.',
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
            async changeEditingFile(newFilePath) {
                const newContent = newFilePath !== undefined ? await window.ipc.files.getFileContent(newFilePath) : ''
                await get().updateContent(newContent)
                set(state => ({
                    ...state,
                    editingFile: { path: newFilePath, lastSavedContent: newContent, openedAt: Date.now() },
                }))
            },
            async saveContentToEditingFile() {
                const { editingFile, content } = get()
                if (editingFile.path) {
                    await window.ipc.files.saveFile(editingFile.path, content)
                    set(state => ({ ...state, lastSavedContent: content }))
                } else {
                    const filePath = await window.ipc.files.selectOutputFile('Save new presentation', [markdownFilter])
                    await window.ipc.files.saveFile(filePath, content)
                    await get().changeEditingFile(filePath)
                }
            },
            async saveOrDiscardChanges() {
                const { content, editingFile, saveContentToEditingFile } = get()
                if (content !== editingFile.lastSavedContent) {
                    const saveFile = await window.ipc.files.showSaveChangesDialog()
                    if (saveFile) await saveContentToEditingFile()
                }
            },
            async exportHTMLPresentation(outputPath: string, standalone = true) {
                const { content, editingFile } = get()
                if (editingFile.path) {
                    await window.ipc.presentation.exportHtml({
                        markdownContent: content,
                        markdownFilePath: editingFile.path,
                        outputPath,
                        mode: standalone ? 'export-standalone' : 'export-relative',
                    })
                } else {
                    throw new Error('Can not export presentation before it is saved into a file.')
                }
            },
        }),
        { name: 'editor-store' }
    )
)
