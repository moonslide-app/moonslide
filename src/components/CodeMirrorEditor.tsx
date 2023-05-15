import { history, indentWithTab, redo, undo } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { EditorView, ViewPlugin, keymap } from '@codemirror/view'
import { useEffect, useRef, useState } from 'react'
import { useDebounce, useEffectOnce } from 'usehooks-ts'
import { useEditorStore } from '../store'
import { oneDark } from '@codemirror/theme-one-dark'

export type CodeMirrorEditorProps = {
    className?: string
}

export function CodeMirrorEditor(props?: CodeMirrorEditorProps) {
    const editingFilePath = useEditorStore(state => state.editingFilePath)
    const [content, updateContent] = useEditorStore(state => [state.content, state.updateContent])
    const [editingContent, setEditingContent] = useState<string>()
    const debouncedContent = useDebounce(editingContent, 1000)

    const editorDomNode = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        updateContent(debouncedContent)
    }, [debouncedContent])

    useEffect(() => {
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
            extensions: [oneDark, myTheme, updatePlugin, keymap.of([indentWithTab]), history()],
        })

        const parent = editorDomNode.current
        let view: EditorView | undefined
        if (parent) {
            view = new EditorView({ state, parent })
        }

        window.ipc.menu.onUndo(() => view && undo(view))
        window.ipc.menu.onRedo(() => view && redo(view))

        return () => view?.destroy()
    }, [editingFilePath])

    return <div ref={editorDomNode} className={props?.className}></div>
}
