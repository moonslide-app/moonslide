import { history, indentWithTab, redo, undo } from '@codemirror/commands'
import { StreamLanguage, LRLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { GFM, parser as mdParser, parseCode } from '@lezer/markdown'
import { parser as htmlParser } from '@lezer/html'
import { parseMixed } from '@lezer/common'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { EditorState } from '@codemirror/state'
import { EditorView, ViewPlugin, keymap, drawSelection } from '@codemirror/view'
import { Ref, forwardRef, useEffect, useRef } from 'react'
import { useEditorStore } from '../store'
import { parser } from '../parser/slidesParser'
import { useCodeMirrorEditorRef } from '../editor/useCodeMirrorEditorRef'
import { findCurrentSlide } from '../editor/codeMirrorHelpers'

export type CodeMirrorEditorProps = {
    className?: string
    onUpdateCurrentSlide?: (slideNumber: number) => void
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
    { tag: tags.monospace, class: 'text-slate-500' },
    { tag: tags.angleBracket, class: 'text-violet-300' },
    { tag: tags.tagName, class: 'text-violet-700 font-bold' },
    { tag: tags.attributeName, class: 'text-violet-500' },
    { tag: tags.attributeValue, class: 'text-rose-500' },
])

const myTheme = EditorView.baseTheme({
    '&': {
        fontSize: '12pt',
    },
})

const markdownParser = mdParser.configure([
    GFM,
    parseCode({
        htmlParser,
    }),
])

const mixedParser = parser.configure({
    wrap: parseMixed(node => {
        if (node.name === 'YamlContent') return { parser: StreamLanguage.define(yaml).parser }
        else if (node.name === 'MarkdownContent')
            return {
                parser: markdownParser,
            }
        else if (node.name === 'StartDelimiter') return { parser: mdParser }
        return null
    }),
})

const mixedPlugin = LRLanguage.define({ parser: mixedParser })

export type CodeMirrorEditorRef = {
    onScrollToSlide(slideNumber: number): void
    onAddSlide(layout?: string, slots?: number): void
    onAddFormat(prefix: string, suffix?: string): void
    onAddBlock(prefix: string): void
    onAddHeading(prefix: string): void
    onAddAttribute(attribute: string): void
    onAddClass(className: string): void
    onAddDataTag(dataTag: string): void
    onAddMedia(path: string): void
}

export const CodeMirrorEditor = forwardRef((props?: CodeMirrorEditorProps, ref?: Ref<CodeMirrorEditorRef>) => {
    const editorView = useRef<EditorView | undefined>()

    const editingFile = useEditorStore(state => state.editingFile)
    const [content, updateContent] = useEditorStore(state => [state.content, state.updateContent])

    useCodeMirrorEditorRef(ref, editorView)

    const editorDomNode = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const updatePlugin = ViewPlugin.define(() => ({
            update: viewUpdate => {
                try {
                    const slideNumber = findCurrentSlide(viewUpdate.state)?.index
                    if (slideNumber) props?.onUpdateCurrentSlide?.(slideNumber)
                } catch (error) {
                    console.warn('Could not find out current slide number: ' + error)
                }

                if (viewUpdate.docChanged) {
                    updateContent(viewUpdate.state.doc.sliceString(0))
                }
            },
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
    }, [editingFile.openedAt])

    return <div ref={editorDomNode} className={`flex-grow overflow-y-auto ${props?.className}`}></div>
})
