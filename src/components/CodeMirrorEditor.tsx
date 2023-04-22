import { EditorState } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { useEffect, useRef, useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'
import { useEditorStore } from '../store'
import { oneDark } from '@codemirror/theme-one-dark'
import { markdown } from '@codemirror/lang-markdown'

export type CodeMirrorEditorProps = {
    className?: string
}

export function CodeMirrorEditor(props?: CodeMirrorEditorProps) {
    const [content, setContent] = useEditorStore(state => [state.content, state.setContent])
    const editingFilePath = useEditorStore(state => state.editingFilePath)

    const editorDomNode = useRef<HTMLDivElement | null>(null)
    const [editor, setEditor] = useState<EditorView>()

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
            update: viewUpdate => setContent(viewUpdate.state.doc.sliceString(0)),
        }))

        const state = EditorState.create({
            doc: content,
            extensions: [oneDark, myTheme, markdown(), updatePlugin],
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
