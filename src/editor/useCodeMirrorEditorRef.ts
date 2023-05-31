import { EditorSelection, SelectionRange } from '@codemirror/state'
import { EditorView } from 'codemirror'
import { Ref, RefObject, useImperativeHandle } from 'react'
import { CodeMirrorEditorRef } from '../components/CodeMirrorEditor'
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
} from './codeMirrorHelpers'

export function useCodeMirrorEditorRef(
    ref: Ref<CodeMirrorEditorRef> | undefined,
    editorView: RefObject<EditorView | undefined>
) {
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
}
