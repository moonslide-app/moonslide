import { create } from 'zustand'
import { useParserStore } from './parser'

type EditorState = {
    editingFilePath: string | undefined
    content: string | undefined
    setContent(newContent: string): void
    changeEditingFile(newFilePath: string): Promise<void>
    saveContentToEditingFile(): Promise<void>
}

export const useEditorStore = create<EditorState>()((set, get) => ({
    editingFilePath: undefined,
    content: undefined,
    setContent: newContent => {
        set(state => ({ ...state, content: newContent }))
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
