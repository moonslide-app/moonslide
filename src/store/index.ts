import { create } from 'zustand'
import { parseMarkdown } from './parser'
import { ParsedContent } from '../../src-shared/entities/ParsedContent'

type EditorStore = {
    editingFilePath: string | undefined
    templateFolderPath: string | undefined
    content: string | undefined
    parsedContent: ParsedContent | undefined
    lastUpdateOfPresentationFiles: number | undefined
    /**
     * Updates the content, parses it and prepares the presentation files.
     */
    updateContent(newContent: string | undefined): Promise<void>
    setTemplateFolderPath(newPath: string): Promise<void>
    changeEditingFile(newFilePath: string): Promise<void>
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
        set(state => ({
            ...state,
            content: newContent,
            parsedContent: parseMarkdown(newContent),
        }))
        await get().preparePresentation()
    },
    setTemplateFolderPath: async newPath => {
        set(state => ({ ...state, templateFolderPath: newPath }))
        await get().preparePresentation()
    },
    async changeEditingFile(newFilePath) {
        const fileContent = await window.ipc.files.getFileContent(newFilePath)
        await get().updateContent(fileContent)
        set(state => ({ ...state, editingFilePath: newFilePath }))
    },
    async saveContentToEditingFile() {
        const { editingFilePath, content } = get()
        if (editingFilePath && content) await window.ipc.files.saveFile(editingFilePath, content)
        else console.error('Could not save editing file, either filePath or content was nullish.')
    },
    async preparePresentation() {
        const { templateFolderPath, parsedContent } = get()
        if (templateFolderPath && parsedContent) {
            await window.ipc.presentation.preparePresentation(parsedContent.htmlString, templateFolderPath)
            set(state => ({ ...state, lastUpdateOfPresentationFiles: Date.now() }))
        } else console.warn('Could not prepare presentation, either templatefolderpath or content was nulllish.')
    },
}))
