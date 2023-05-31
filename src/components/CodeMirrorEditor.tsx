import { history, indentWithTab, redo, undo } from '@codemirror/commands'
import { StreamLanguage, LRLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { parser as mdParser, Strikethrough } from '@lezer/markdown'
import { parseMixed } from '@lezer/common'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { EditorSelection, EditorState, SelectionRange } from '@codemirror/state'
import { EditorView, ViewPlugin, keymap, drawSelection, lineNumbers } from '@codemirror/view'
import { Ref, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useEditorStore } from '../store'
import { parser } from '../parser/slidesParser'
import {
    ModifiedString,
    addSpaceIfNeeded,
    changeInRange,
    createNewSlideTemplate,
    currentMarkdownLineInSlide,
    extractLineAttributes,
    findCurrentSlide,
    findLastSlide,
    insertAtEndOfLine,
    insertAtPosition,
    insertLine,
    insertLineWithPrefix,
    isYAMLArray,
    isYAMLMultiline,
    markdownSelectionInSlide,
    rangeHasLineStartingWith,
    removeHeadingFromLine,
    setCursorPosition,
} from '../editor/codeMirrorHelpers'

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

    const editingFilePath = useEditorStore(state => state.editingFilePath)
    const [content, updateContent] = useEditorStore(state => [state.content, state.updateContent])

    useImperativeHandle(ref, () => ({
        onAddSlide(layout, slots) {
            if (!editorView.current) return
            const { doc } = editorView.current.state

            const { template, offset } = createNewSlideTemplate(layout, slots)
            const position = findLastSlide(editorView.current.state)?.markdown.to ?? doc.length
            const newPosition = insertAtPosition(editorView.current, template, position)

            setCursorPosition(editorView.current, newPosition - offset)
        },
        onAddFormat(prefix, suffix) {
            if (!editorView.current) return

            const currentSlide = findCurrentSlide(editorView.current.state)
            if (!currentSlide) return

            let unwrappedPrefix = prefix ?? ''
            let unwrappedSuffix = suffix ?? prefix ?? ''

            const currentMarkdown = markdownSelectionInSlide(editorView.current, currentSlide)
            const selection = changeInRange(editorView.current, currentMarkdown, (oldValue, doc) => {
                unwrappedPrefix = addSpaceIfNeeded(doc, currentMarkdown.from, unwrappedPrefix, true, false).newValue
                unwrappedSuffix = addSpaceIfNeeded(doc, currentMarkdown.to, unwrappedSuffix, false, true).newValue
                return `${unwrappedPrefix}${oldValue}${unwrappedSuffix}`
            })
            setCursorPosition(editorView.current, selection.to - unwrappedSuffix.length)
        },
        onAddBlock(prefix) {
            if (!editorView.current) return

            const currentSlide = findCurrentSlide(editorView.current.state)
            if (!currentSlide) return

            const line = currentMarkdownLineInSlide(editorView.current, currentSlide)
            const position = insertAtPosition(editorView.current, prefix, line.from)
            setCursorPosition(editorView.current, position)
        },
        onAddHeading(prefix) {
            if (!editorView.current) return

            const currentSlide = findCurrentSlide(editorView.current.state)
            if (!currentSlide) return

            let line = currentMarkdownLineInSlide(editorView.current, currentSlide)
            line = removeHeadingFromLine(editorView.current, line)
            const position = insertAtPosition(editorView.current, prefix, line.from)
            setCursorPosition(editorView.current, position)
        },
        onAddAttribute(className) {
            if (!editorView.current) return

            const currentSlide = findCurrentSlide(editorView.current.state)
            if (!currentSlide) return

            let selection = markdownSelectionInSlide(editorView.current, currentSlide)
            let position: SelectionRange

            if (selection.from === selection.to) {
                const currentLine = editorView.current.state.doc.lineAt(selection.from)
                selection = EditorSelection.range(currentLine.to, currentLine.to)
                let newAttributes = `{ ${className} }`

                const existingAttributes = extractLineAttributes(currentLine)
                console.log('existing attributes', existingAttributes)
                if (existingAttributes) {
                    const { originalAttributes, extractedAttributes } = existingAttributes
                    const attributesStart = currentLine.to - originalAttributes.length
                    selection = EditorSelection.range(attributesStart, currentLine.to)
                    newAttributes = `{ ${extractedAttributes} ${className} }`
                }

                position = changeInRange(
                    editorView.current,
                    selection,
                    (_, doc) => addSpaceIfNeeded(doc, selection.from, newAttributes, true, false).newValue
                )
            } else {
                position = changeInRange(
                    editorView.current,
                    selection,
                    (oldValue, doc) =>
                        addSpaceIfNeeded(doc, selection.from, `[${oldValue}]{ ${className} }`, true, false).newValue
                )
            }

            setCursorPosition(editorView.current, position.to)
        },
        onAddClass(className) {
            if (!editorView.current) return
            const state = editorView.current.state
            const currentSlide = findCurrentSlide(state)

            if (currentSlide?.frontMatter) {
                let newCursorPosition: number

                const line = rangeHasLineStartingWith('class:', editorView.current.state, currentSlide.frontMatter)
                if (line) {
                    const yamlMultiline =
                        isYAMLArray(line, state, currentSlide.frontMatter) ??
                        isYAMLMultiline(line, state, currentSlide.frontMatter)
                    if (yamlMultiline) {
                        newCursorPosition = insertLineWithPrefix(
                            editorView.current,
                            className,
                            yamlMultiline.nextPosition,
                            yamlMultiline.prefix
                        )
                    } else {
                        newCursorPosition = insertAtEndOfLine(editorView.current, className, line)
                    }
                } else {
                    newCursorPosition = insertLine(
                        editorView.current,
                        `class: ${className}`,
                        currentSlide.frontMatter.to
                    )
                }

                setCursorPosition(editorView.current, newCursorPosition)
            }
        },
        onAddDataTag(dataTag) {
            if (!editorView.current) return
            const state = editorView.current.state
            const currentSlide = findCurrentSlide(state)

            if (currentSlide?.frontMatter) {
                const line = rangeHasLineStartingWith(`${dataTag}:`, editorView.current.state, currentSlide.frontMatter)
                if (line) {
                    setCursorPosition(editorView.current, line.to)
                } else {
                    const cursorPosition = insertLine(editorView.current, `${dataTag}: `, currentSlide.frontMatter.to)
                    setCursorPosition(editorView.current, cursorPosition)
                }
            }
        },
        onAddMedia(path) {
            if (!editorView.current) return

            const currentSlide = findCurrentSlide(editorView.current.state)
            if (!currentSlide) return

            const currentMarkdown = markdownSelectionInSlide(editorView.current, currentSlide)
            const position = EditorSelection.range(currentMarkdown.to, currentMarkdown.to)
            let imageTag: ModifiedString = { newValue: '', leadingOffset: 0, trailingOffset: 0 }

            const selection = changeInRange(editorView.current, position, (_, doc) => {
                imageTag = addSpaceIfNeeded(doc, position.to, `![](${path})`, true, true)
                return imageTag.newValue
            })
            const cursorPosition = selection.to + imageTag.leadingOffset + 2 - imageTag.newValue.length
            setCursorPosition(editorView.current, cursorPosition)
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
