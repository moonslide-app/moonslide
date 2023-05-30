import { history, indentWithTab, redo, undo } from '@codemirror/commands'
import { StreamLanguage, LRLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { parser as mdParser, Strikethrough } from '@lezer/markdown'
import { parseMixed } from '@lezer/common'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { EditorSelection, EditorState } from '@codemirror/state'
import { RegExpCursor } from '@codemirror/search'
import { EditorView, ViewPlugin, keymap, drawSelection, lineNumbers } from '@codemirror/view'
import { Ref, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useEditorStore } from '../store'
import { parser } from '../parser/slidesParser'

export type CodeMirrorEditorProps = {
    className?: string
}

const myHighlightStyle = HighlightStyle.define([
    { tag: tags.keyword, class: 'text-violet-700 font-bold' },
    { tag: tags.heading1, class: 'font-bold text-2xl' },
    { tag: tags.heading2, class: 'font-bold text-xl' },
    { tag: tags.heading3, class: 'font-bold text-lg' },
    { tag: tags.heading4, class: 'font-bold' },
    { tag: tags.heading5, class: 'font-bold' },
    { tag: tags.heading6, class: 'font-bold' },
    { tag: tags.url, class: 'text-violet-300' },
    { tag: tags.contentSeparator, class: 'font-bold text-violet-400' },
    { tag: tags.emphasis, class: 'italic' },
    { tag: tags.strong, class: 'font-bold' },
    { tag: tags.strikethrough, class: 'line-through' },
])

const myTheme = EditorView.baseTheme({
    '&': {
        fontSize: '12pt',
    },
})

const mixedParser = parser.configure({
    wrap: parseMixed(node => {
        if (node.name === 'YamlContent') return { parser: StreamLanguage.define(yaml).parser }
        else if (node.name === 'MarkdownContent') return { parser: mdParser.configure(Strikethrough) }
        else if (node.name === 'StartDelimiter') return { parser: mdParser }
        return null
    }),
})

const mixedPlugin = LRLanguage.define({ parser: mixedParser })

export type CodeMirrorEditorRef = {
    onAddSlide(layout?: string): void
    onAddFormat(prefix: string, suffix?: string): void
    onAddBlock(prefix: string): void
    onAddModifier(className: string): void
    onAddClass(className: string): void
    onAddDataTag(dataTag: string): void
    onAddMedia(path: string): void
}

export const CodeMirrorEditor = forwardRef((props?: CodeMirrorEditorProps, ref?: Ref<CodeMirrorEditorRef>) => {
    const editorView = useRef<EditorView | undefined>()

    const editingFilePath = useEditorStore(state => state.editingFilePath)
    const [content, updateContent] = useEditorStore(state => [state.content, state.updateContent])

    useImperativeHandle(ref, () => ({
        onAddSlide(layout) {
            if (editorView.current && layout) {
                editorView.current.dispatch(editorView.current.state.replaceSelection(layout))
            }
        },
        onAddFormat(prefix, suffix) {
            console.log('add format', prefix, suffix)
        },
        onAddBlock(prefix) {
            console.log('add block', prefix)
        },
        onAddModifier(className) {
            if (editorView.current) {
                editorView.current.dispatch(editorView.current.state.replaceSelection(className))
            }
        },
        onAddClass(className) {
            if (editorView.current) {
                editorView.current.dispatch(editorView.current.state.replaceSelection(className))
            }
        },
        onAddDataTag(dataTag) {
            if (editorView.current) {
                const state = editorView.current.state
                const currentSlide = findCurrentSlide(state)
                console.log('front matter', currentSlide?.frontMatter)
                console.log('markdown', currentSlide?.markdown)

                if (currentSlide?.markdown) {
                    editorView.current.dispatch(
                        editorView.current.state.changeByRange(() => ({
                            range: currentSlide.markdown,
                        }))
                    )
                }
            }
        },
        onAddMedia(path) {
            if (editorView.current) {
                editorView.current.dispatch(editorView.current.state.replaceSelection(path))
            }
        },
    }))

    const editorDomNode = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const updatePlugin = ViewPlugin.define(() => ({
            update: viewUpdate => updateContent(viewUpdate.state.doc.sliceString(0)),
        }))

        const state = EditorState.create({
            doc: content,
            extensions: [
                myTheme,
                mixedPlugin,
                syntaxHighlighting(myHighlightStyle),
                updatePlugin,
                keymap.of([indentWithTab]),
                history(),
                EditorView.lineWrapping,
                drawSelection(),
                lineNumbers(),
            ],
        })

        const parent = editorDomNode.current

        if (parent && state) {
            editorView.current = new EditorView({ state, parent })
        }

        const view = editorView.current

        window.ipc.menu.onUndo(() => view && undo(view))
        window.ipc.menu.onRedo(() => view && redo(view))

        return () => view?.destroy()
    }, [editingFilePath])

    return <div ref={editorDomNode} className={`flex-grow overflow-y-auto ${props?.className}`}></div>
})

function findCurrentSlide(state: EditorState) {
    const regexQuery = '^---(.|\n)*?^---'

    const currentPosition = state.selection.main.anchor

    const cursor = new RegExpCursor(state.doc, regexQuery, {})

    let currentFrontMatter: { from: number; to: number } | undefined
    let nextFrontMatter: { from: number; to: number } | undefined

    while (!cursor.done) {
        currentFrontMatter = nextFrontMatter
        nextFrontMatter = cursor.next().value
        if (nextFrontMatter && nextFrontMatter.from >= currentPosition) break
    }

    if (cursor.done) nextFrontMatter = undefined // cursor was in last slide, there is no next
    if (!currentFrontMatter) return undefined

    const currentMarkdown = { from: currentFrontMatter.to + 1, to: (nextFrontMatter?.from ?? state.doc.length) - 1 }

    return {
        frontMatter: EditorSelection.range(currentFrontMatter.from, currentFrontMatter.to),
        markdown: EditorSelection.range(currentMarkdown.from, currentMarkdown.to),
    }
}
