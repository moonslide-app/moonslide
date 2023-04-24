import { create } from 'zustand'
import { Presentation, comparePresentations } from '../../src-shared/entities/Presentation'

type EditorStore = {
    editingFilePath: string | undefined
    content: string | undefined
    parsedContent: Presentation | undefined
    slidesLastUpdate: number[]
    /**
     * Updates the content, parses it and prepares the presentation files.
     */
    updateContent(newContent: string | undefined): Promise<void>
    updateParsedContent(newContent: Presentation): Promise<void>
    changeEditingFile(newFilePath: string | undefined): Promise<void>
    saveContentToEditingFile(): Promise<void>
    preparePresentation(): Promise<void>
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
    editingFilePath: undefined,
    templateFolderPath: undefined,
    content: undefined,
    parsedContent: undefined,
    slidesLastUpdate: [],
    updateContent: async newContent => {
        set(state => ({ ...state, content: newContent }))
        if (!newContent) return

        try {
            const parsedContent = await window.ipc.presentation.parsePresentation({
                markdownContent: newContent,
                markdownFilePath: get().editingFilePath,
            })
            get().updateParsedContent(parsedContent)
        } catch (error) {
            console.warn(error)
        }
    },
    updateParsedContent: async newParsedContent => {
        const { parsedContent, slidesLastUpdate } = get()
        set(state => ({ ...state, parsedContent: newParsedContent }))

        const comparison = comparePresentations(parsedContent, newParsedContent)
        if (comparison.templateChange)
            await window.ipc.presentation.prepareTemplate(newParsedContent.resolvedPaths.templateFolder)

        const newSlidesLastUpdate = comparison.slideChanges.map((update, idx) =>
            update ? Date.now() : slidesLastUpdate[idx]
        )

        await get().preparePresentation()
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
        const { parsedContent } = get()
        if (parsedContent) {
            await window.ipc.presentation.preparePresentation(parsedContent)
        } else console.warn('Could not prepare presentation, either parsedContent or editingFilePath was nullish.')
    },
}))
