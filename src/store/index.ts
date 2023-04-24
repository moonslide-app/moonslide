import { create } from 'zustand'
import { Presentation } from '../../src-shared/entities/Presentation'

type EditorStore = {
    editingFilePath: string | undefined
    content: string | undefined
    parsedContent: Presentation | undefined
    lastUpdateOfPresentationFiles: number | undefined
    /**
     * Updates the content, parses it and prepares the presentation files.
     */
    updateContent(newContent: string | undefined): Promise<void>
    changeEditingFile(newFilePath: string | undefined): Promise<void>
    saveContentToEditingFile(): Promise<void>
    preparePresentation(): Promise<void>
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
    editingFilePath: undefined,
    templateFolderPath: undefined,
    content: undefined,
    parsedContent: undefined,
    lastUpdateOfPresentationFiles: undefined,
    updateContent: async newContent => {
        // set both seperatly so parsing errors don't affect content
        set(state => ({ ...state, content: newContent }))
        if (!newContent) return
        try {
            const parsedContent = await window.ipc.presentation.parsePresentation({
                markdownContent: newContent,
                markdownFilePath: get().editingFilePath,
            })
            set(state => ({ ...state, parsedContent }))
            await get().preparePresentation()
        } catch (error) {
            console.warn(error)
        }
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
            set(state => ({ ...state, lastUpdateOfPresentationFiles: Date.now() }))
        } else console.warn('Could not prepare presentation, either parsedContent or editingFilePath was nullish.')
    },
}))
