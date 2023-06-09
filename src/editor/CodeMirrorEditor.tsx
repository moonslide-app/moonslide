import { history, indentWithTab } from '@codemirror/commands'
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
import { CodeMirrorEditorRef, useCodeMirrorEditorRef } from './CodeMirrorEditorRef'
import { findCurrentSlide } from './codeMirrorHelpers'
import { showActiveSlide } from './showActiveSlide'

export type CodeMirrorEditorProps = {
    className?: string
    onUpdateCurrentSlide?: (slideNumber: number) => void
}

const myTheme = EditorView.baseTheme({
    '&': {
        fontSize: '12pt',
        height: '100%',
    },
    '&, .cm-scroller': {
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
    '.active-slide-layer': {
        zIndex: '-4 !important',
    },
    '.active-slide': {
        backgroundColor: 'hsl(var(--accent-quaternary))',
    },
    '&.cm-focused .cm-scroller .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: 'hsl(var(--accent-tertiary))',
    },
    '.cm-cursor': {
        borderColor: 'hsl(var(--accent-primary))',
        borderLeftWidth: '2px',
    },
    '.cm-content': {
        padding: '1rem 0',
    },
    '.cm-line': {
        padding: '0 1rem',
    },
    '.cm-scroller': { overflow: 'auto', height: '100%', backgroundColor: 'hsl(var(--background-primary))' },
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

const myHighlightStyle = HighlightStyle.define(
    [
        { tag: tags.keyword, class: 'font-bold' },
        { tag: tags.heading1, class: 'font-bold text-2xl' },
        { tag: tags.heading2, class: 'font-bold text-xl' },
        { tag: tags.heading3, class: 'font-bold text-lg' },
        { tag: tags.heading4, class: 'font-bold' },
        { tag: tags.heading5, class: 'font-bold' },
        { tag: tags.heading6, class: 'font-bold' },
        { tag: tags.url, class: 'text-foreground-tertiary' },
        { tag: tags.contentSeparator, class: 'font-bold text-foreground-quaternary' },
        { tag: tags.emphasis, class: 'italic' },
        { tag: tags.strong, class: 'font-bold' },
        { tag: tags.strikethrough, class: 'line-through' },
        { tag: tags.monospace, class: 'text-foreground-quaternary' },
        { tag: tags.angleBracket, class: 'text-foreground-tertiary' },
        { tag: tags.tagName, class: 'text-foreground-tertiary font-bold' },
        { tag: tags.attributeName, class: 'text-foreground-secondary' },
        { tag: tags.attributeValue, class: 'text-foreground-secondary' },
    ],
    {
        scope: mixedPlugin,
    }
)

export const CodeMirrorEditor = forwardRef((props?: CodeMirrorEditorProps, ref?: Ref<CodeMirrorEditorRef>) => {
    const editorView = useRef<EditorView | undefined>()

    const editingFile = useEditorStore(state => state.editingFile)
    const [content, updateContent] = useEditorStore(state => [state.content, state.updateContent])

    const { undo, redo } = useCodeMirrorEditorRef(ref, editorView)

    const editorDomNode = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const updatePlugin = ViewPlugin.define(() => ({
            update: viewUpdate => {
                // ignore focus updates
                if (viewUpdate.focusChanged) return

                try {
                    const slideRange = findCurrentSlide(viewUpdate.state)
                    if (slideRange) props?.onUpdateCurrentSlide?.(slideRange.index)
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
                showActiveSlide(),
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

        window.ipc.menu.onUndo(undo)
        window.ipc.menu.onRedo(redo)

        return () => view?.destroy()
    }, [editingFile.openedAt])

    return <div ref={editorDomNode} className={props?.className}></div>
})
