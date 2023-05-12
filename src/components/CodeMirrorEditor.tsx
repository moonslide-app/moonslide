import { EditorState } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { useEffect, useRef, useState } from 'react'
import { useDebounce, useEffectOnce } from 'usehooks-ts'
import { useEditorStore } from '../store'
import { oneDark } from '@codemirror/theme-one-dark'
import { markdown } from '@codemirror/lang-markdown'

export type CodeMirrorEditorProps = {
    className?: string
}

export function CodeMirrorEditor(props?: CodeMirrorEditorProps) {
    const editingFilePath = useEditorStore(state => state.editingFilePath)
    const [content, updateContent] = useEditorStore(state => [state.content, state.updateContent])
    const [editingContent, setEditingContent] = useState<string>()
    const debouncedContent = useDebounce(editingContent, 1000)

    const editorDomNode = useRef<HTMLDivElement | null>(null)
    const [editor, setEditor] = useState<EditorView>()

    useEffect(() => {
        updateContent(debouncedContent)
    }, [debouncedContent])

    // This hook is and should only be called when the editing file changes
    useEffect(() => {
        if (!editor) return
        if (editor.state.doc.sliceString(0) !== content) {
            const transaction = editor.state.update({
                changes: {
                    from: 0,
                    to: editor.state.doc.length,
                    insert: content,
                },
            })
            editor.update([transaction])
            setEditingContent(content)
        }
    }, [editingFilePath])

    useEffectOnce(() => {
        const myTheme = EditorView.theme({
            '&': {
                fontSize: '20px',
                minHeight: '100%',
            },
        })

        const updatePlugin = ViewPlugin.define(() => ({
            update: viewUpdate => setEditingContent(viewUpdate.state.doc.sliceString(0)),
        }))

        const state = EditorState.create({
            doc: content,
            extensions: [oneDark, myTheme, updatePlugin],
        })

        const parent = editorDomNode.current
        let view: EditorView | undefined
        if (parent) {
            view = new EditorView({ state, parent })
            setEditor(view)
        }

        return () => view?.destroy()
    })

    return <div ref={editorDomNode} className={props?.className}></div>
}
