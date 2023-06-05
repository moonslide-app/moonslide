import { EditorSelection } from '@codemirror/state'
import { EditorView } from 'codemirror'
import { Ref, RefObject, useImperativeHandle } from 'react'
import {
    ModifiedString,
    SimpleRange,
    addSpaceIfNeeded,
    changeInRange,
    createNewSlideTemplate,
    currentMarkdownLineInSlide,
    findAttributes,
    findBracketsInsideSelection,
    findCurrentSlide,
    findLastSlide,
    findLastSlideUntil,
    findValueOfArrayInsideRange,
    insertAtEndOfLine,
    insertAtPosition,
    insertLine,
    insertLineWithPrefix,
    isYAMLArray,
    isYAMLMultiline,
    markdownSelectionInSlide,
    rangeHasLineStartingWith,
    removeHeadingFromLine,
    selectRange,
    setCursorPosition,
} from './codeMirrorHelpers'
import { useEditorStore } from '../store'
import { ToolbarEntry, ToolbarItem } from '../../src-shared/entities/Toolbar'

export type CodeMirrorEditorRef = {
    onScrollToSlide(slideNumber: number): void
    onAddSlide(layout?: string, slots?: number): void
    onAddFormat(prefix: string, suffix?: string): void
    onAddBlock(prefix: string): void
    onAddHeading(prefix: string): void
    onAddAttribute(item: ToolbarItem, group: ToolbarEntry): void
    onAddClass(item: ToolbarItem, group: ToolbarEntry): void
    onAddDataTag(dataTag: string): void
    onAddMedia(path: string): void
}

export function useCodeMirrorEditorRef(
    ref: Ref<CodeMirrorEditorRef> | undefined,
    editorView: RefObject<EditorView | undefined>
) {
    const toolbarConfig = useEditorStore(state => state.parsedPresentation?.templateConfig.toolbar)

    useImperativeHandle(
        ref,
        () => ({
            onScrollToSlide(slideNumber) {
                if (!editorView.current) return
                const slidePosition = findLastSlideUntil(editorView.current?.state, { slideNumber })
                if (slidePosition) {
                    setCursorPosition(editorView.current, slidePosition?.markdown.from, true)
                }
            },
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
            onAddAttribute(item, group) {
                const view = editorView.current
                const state = view?.state
                const currentSlide = state && findCurrentSlide(state)
                if (!view || !state || !currentSlide) return

                const groupValues = group.items.map(value => value.key)
                let selection = markdownSelectionInSlide(view, currentSlide)
                const contentSelected = selection.from !== selection.to
                const currentLine = state.doc.lineAt(selection.from)
                let bracketsRange: SimpleRange | undefined = findBracketsInsideSelection(state, selection, currentLine)

                if (contentSelected && !bracketsRange) {
                    selection = changeInRange(view, selection, value => `[${value}]`)
                    bracketsRange = selection
                }

                if (bracketsRange) {
                    // Attributes anywhere after brackets
                    const attributesRange = findAttributes(state, false, {
                        from: bracketsRange.from,
                        to: currentLine.to,
                    })
                    // there are already attributes for this bracketed span
                    if (attributesRange && bracketsRange.to + 1 === attributesRange.from) {
                        const sameGroupRange = findValueOfArrayInsideRange(state, groupValues, attributesRange)
                        if (sameGroupRange) {
                            changeInRange(view, sameGroupRange, () => item.key)
                        } else {
                            const spaced = addSpaceIfNeeded(state.doc, attributesRange.to, item.key, true, true)
                            insertAtPosition(view, spaced.newValue, attributesRange.to)
                        }
                    } else {
                        insertAtPosition(view, `{ ${item.key} }`, bracketsRange.to)
                    }
                } else {
                    const attributesRange = findAttributes(state, true, currentLine)
                    if (attributesRange) {
                        const sameGroupRange = findValueOfArrayInsideRange(state, groupValues, attributesRange)
                        if (sameGroupRange) {
                            changeInRange(view, sameGroupRange, () => item.key)
                        } else {
                            const spaced = addSpaceIfNeeded(state.doc, attributesRange.to, item.key, true, true)
                            insertAtPosition(view, spaced.newValue, attributesRange.to)
                        }
                    } else {
                        insertAtEndOfLine(view, `{ ${item.key} }`, currentLine)
                    }
                }

                selectRange(editorView.current, selection)
            },
            onAddClass(item, group) {
                if (!editorView.current) return
                const state = editorView.current.state
                const currentSlide = findCurrentSlide(state)
                const className = item.key

                if (currentSlide?.frontMatter) {
                    let newCursorPosition: number

                    const line = rangeHasLineStartingWith('class:', state, currentSlide.frontMatter)
                    const sameGroupRange = line
                        ? findValueOfArrayInsideRange(
                              state,
                              group.items.map(value => value.key),
                              { from: line.from, to: currentSlide.frontMatter.to }
                          )
                        : undefined

                    if (sameGroupRange) {
                        newCursorPosition = changeInRange(editorView.current, sameGroupRange, () => className).to
                    } else if (line) {
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
                            `class:\n - ${className}`,
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
                    const line = rangeHasLineStartingWith(
                        `${dataTag}:`,
                        editorView.current.state,
                        currentSlide.frontMatter
                    )
                    if (line) {
                        setCursorPosition(editorView.current, line.to)
                    } else {
                        const cursorPosition = insertLine(
                            editorView.current,
                            `${dataTag}: `,
                            currentSlide.frontMatter.to
                        )
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
        }),
        [toolbarConfig]
    )
}
