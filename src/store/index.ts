import { create } from 'zustand'
import { ParsedContent, parseMarkdown } from './parser'

type EditorStore = {
    editingFilePath: string | undefined
    content: string | undefined
    parsedContent: ParsedContent | undefined
    setContent(newContent: string): void
    changeEditingFile(newFilePath: string): Promise<void>
    saveContentToEditingFile(): Promise<void>
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
    editingFilePath: undefined,
    content: undefined,
    parsedContent: undefined,
    setContent: newContent => {
        set(state => ({
            ...state,
            content: newContent,
            parsedContent: parseMarkdown(newContent),
        }))
    },
    async changeEditingFile(newFilePath) {
        const fileContent = await window.ipc.files.getFileContent(newFilePath)
        set(state => ({ ...state, editingFilePath: newFilePath, content: fileContent }))
    },
    async saveContentToEditingFile() {
        const { editingFilePath, content } = get()
        if (editingFilePath && content) await window.ipc.files.saveFile(editingFilePath, content)
    },
}))
