import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Presentation, comparePresentations } from '../../src-shared/entities/Presentation'
import { markdownFilter } from './FileFilters'
import { replaceBackwardSlash } from '../../src-shared/helpers/pathNormalizer'

export type EditingFile = {
    /**
     * The absolute path of the file.
     */
    path: string | undefined
    /**
     * The name of the file.
     */
    filename: string | undefined
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
    /**
     * Makes an ipc call to decide if the media should be copied.
     * Returns the path which should be used to reference the media.
     */
    getMediaPath(path: string): Promise<string>
}

let parseTimeout: number | undefined = undefined
const PARSE_INTERVAL = 350

let fullReloadTimeout: number | undefined = undefined
const FULL_RELOAD_INTERVAL = 500

export const useEditorStore = create<EditorStore>()(
    persist(
        (set, get) => ({
            editingFile: {
                path: undefined,
                filename: undefined,
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
                window.clearTimeout(parseTimeout)
                parseTimeout = window.setTimeout(get().parsePresentation, PARSE_INTERVAL)
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
                const { parsedPresentation } = get()
                set(state => ({ ...state, parsedPresentation: newParsedPresentation }))

                clearTimeout(fullReloadTimeout)
                fullReloadTimeout = window.setTimeout(() => {
                    const comparison = comparePresentations(parsedPresentation, newParsedPresentation)
                    if (comparison.templateChange || comparison.themeChange || comparison.titleChange) {
                        set(state => ({ ...state, lastFullUpdate: Date.now() }))
                    }
                }, FULL_RELOAD_INTERVAL)
            },
            async reloadAllPreviews() {
                await get().parsePresentation()
                set(state => ({ ...state, lastFullUpdate: Date.now() }))
            },
            async changeEditingFile(newFilePath) {
                const filename = newFilePath !== undefined ? await window.ipc.files.basename(newFilePath) : undefined
                const newContent = newFilePath !== undefined ? await window.ipc.files.getFileContent(newFilePath) : ''
                get().updateParsedPresentation(undefined)
                await get().updateContent(newContent)
                set(state => ({
                    ...state,
                    editingFile: {
                        path: newFilePath,
                        filename,
                        lastSavedContent: newContent,
                        openedAt: Date.now(),
                    },
                }))
            },
            async saveContentToEditingFile() {
                const { editingFile, content } = get()
                if (editingFile.path) {
                    await window.ipc.files.saveFile(editingFile.path, content)
                    set(state => ({ ...state, editingFile: { ...editingFile, lastSavedContent: content } }))
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
            async getMediaPath(path) {
                const markdownPath = get().editingFile.path
                if (!markdownPath) return replaceBackwardSlash(path)
                else return window.ipc.files.addMedia(path, markdownPath)
            },
        }),
        { name: 'editor-store' }
    )
)
