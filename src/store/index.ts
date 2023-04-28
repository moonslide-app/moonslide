import { create } from 'zustand'
import { Presentation, comparePresentations } from '../../src-shared/entities/Presentation'

type EditorStore = {
    /**
     * The absolute path of the current editing markdown file.
     */
    editingFilePath: string | undefined
    /**
     * The file contents of the editing markdown file.
     */
    content: string | undefined
    /**
     * The presentation, which was parsed from the `content`.
     */
    parsedPresentation: Presentation | undefined
    /**
     * This array contains a number for every slide currently present
     * in the `parsedPresentation`. The number represents the timestamp
     * when the slide was last updated.
     */
    slidesLastUpdate: number[]
    /**
     * Changes the editing file path.
     * This will try to read the file from the new path and
     * call `updateContent` with the new file content.
     */
    changeEditingFile(newFilePath: string | undefined): Promise<void>
    /**
     * Updates the content in the store. The newContent is parsed and will
     * result in a call to `updateParsedPresentation` if successful.
     */
    updateContent(newContent: string | undefined): Promise<void>
    /**
     * Updates the parsed presentation in the store.
     * This will also update the `slidesLastUpdate`.
     * Depending on the changes, this function will make sure that
     * the presentation (and template) files are updated by calling the
     * appropriate ipc functions in the backend.
     */
    updateParsedPresentation(newContent: Presentation | undefined): Promise<void>
    /**
     * The `content` is saved to the file at `editingFilePath`.
     */
    saveContentToEditingFile(): Promise<void>
    /**
     * This methods calls the ipc function to rebuild the presentation (and preview) files.
     */
    preparePresentation(): Promise<void>

    exportPresentation(): Promise<void>
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
    editingFilePath: undefined,
    templateFolderPath: undefined,
    content: undefined,
    parsedPresentation: undefined,
    slidesLastUpdate: [],
    updateContent: async newContent => {
        set(state => ({ ...state, content: newContent }))

        if (!newContent) {
            await get().updateParsedPresentation(undefined)
            return
        }

        try {
            const parsedPresentation = await window.ipc.presentation.parsePresentation({
                markdownContent: newContent,
                markdownFilePath: get().editingFilePath,
            })
            get().updateParsedPresentation(parsedPresentation)
        } catch (error) {
            console.warn(error)
        }
    },
    updateParsedPresentation: async newParsedPresentation => {
        const { parsedPresentation, slidesLastUpdate } = get()
        set(state => ({ ...state, parsedPresentation: newParsedPresentation }))

        const comparison = comparePresentations(parsedPresentation, newParsedPresentation)
        if (comparison.templateChange) {
            if (newParsedPresentation !== undefined) {
                await window.ipc.presentation.prepareTemplate(newParsedPresentation.resolvedPaths.templateFolder)
            } else {
                await window.ipc.presentation.clearOutputFolder()
            }
        }

        if (newParsedPresentation) await get().preparePresentation()

        const newSlidesLastUpdate = comparison.slideChanges.map((update, idx) =>
            update ? Date.now() : slidesLastUpdate[idx]
        )
        set(state => ({ ...state, slidesLastUpdate: newSlidesLastUpdate }))
    },
    async changeEditingFile(newFilePath) {
        if (newFilePath !== undefined) {
            const fileContent = await window.ipc.files.getFileContent(newFilePath)
            await get().updateContent(fileContent)
        } else {
            await get().updateContent(undefined)
        }
        set(state => ({ ...state, editingFilePath: newFilePath }))
    },
    async saveContentToEditingFile() {
        const { editingFilePath, content } = get()
        if (editingFilePath && content) await window.ipc.files.saveFile(editingFilePath, content)
        else console.error('Could not save editing file, either filePath or content was nullish.')
    },
    async preparePresentation() {
        const { parsedPresentation } = get()
        if (parsedPresentation) {
            await window.ipc.presentation.preparePresentation(parsedPresentation)
        } else console.warn('Could not prepare presentation, either parsedPresentation or editingFilePath was nullish.')
    },
    async exportPresentation() {
        const { parsedPresentation } = get()
        if (parsedPresentation) {
            const outputPath = await window.ipc.files.selectOutputFolder()
            if (outputPath) await window.ipc.presentation.exportPresentation(parsedPresentation, outputPath)
        }
    },
}))
