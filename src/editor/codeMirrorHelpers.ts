import { EditorSelection, EditorState, Line, SelectionRange, Text } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { RegExpCursor } from '@codemirror/search'

/*
 * ---------- Finding Slides ----------
 */

export type SimpleRange = {
    from: number
    to: number
}

export type SlideSelection = {
    index: number
    frontMatter: SelectionRange
    markdown: SelectionRange
}

export type ModifiedString = {
    newValue: string
    leadingOffset: number
    trailingOffset: number
}

/*
 * ---------- Finding Slides ----------
 */

/**
 * Get the selecton ranges for both front matter and markdown that
 * represent the slide in which the cursor is currently positioned.
 * @param state Editor state to search in.
 * @returns Information about the current slide or `undefined` if no slide is found.
 */
export function findCurrentSlide(state: EditorState): SlideSelection | undefined {
    const currentPosition = state.selection.main.from
    return findLastSlideUntil(state, currentPosition)
}

/**
 * Get the selection range for both front matter and markdown that
 * represent the last slide in the document.
 * @param state Editor state to search in.
 * @returns Information about the last slide or `undefined` if no slide is found.
 */
export function findLastSlide(state: EditorState): SlideSelection | undefined {
    const endPosition = state.doc.length
    return findLastSlideUntil(state, endPosition)
}

/**
 * Find the selection range for both front matter and markdown that
 * represents the last slide up to the position passed.
 * @param state Editor state to search in.
 * @param position Position up to which slides are searched.
 * @returns Information about the last found slide or `undefined` if no slide is found.
 */
function findLastSlideUntil(state: EditorState, position: number): SlideSelection | undefined {
    const regexQuery = '^---(.|\n)*?^---'

    const cursor = new RegExpCursor(state.doc, regexQuery)

    let currentFrontMatter: SimpleRange | undefined
    let nextFrontMatter: SimpleRange | undefined

    let nextIndex = -1

    while (!cursor.done) {
        currentFrontMatter = nextFrontMatter
        nextFrontMatter = cursor.next().value
        nextIndex++
        if (nextFrontMatter && nextFrontMatter.from > position) break
    }

    if (cursor.done) nextFrontMatter = undefined // cursor was in last slide, there is no next
    if (!currentFrontMatter) return undefined

    const endOfDocument = lastNonEmptyLine(state, currentFrontMatter.to + 1, 2)
    const currentMarkdownEnd = nextFrontMatter ? nextFrontMatter.from - 1 : endOfDocument.to

    const currentMarkdown = {
        from: currentFrontMatter.to + 1,
        to: currentMarkdownEnd,
    }

    const frontMatterSecondLine = state.doc.lineAt(currentFrontMatter.from).number + 1
    const frontMatterSecondLastLine = state.doc.lineAt(currentFrontMatter.to).number - 1

    const trimmedFrontMatter: SimpleRange = {
        from: state.doc.line(frontMatterSecondLine).from - 1,
        to: state.doc.line(frontMatterSecondLastLine).to,
    }

    return {
        index: nextIndex - 1,
        frontMatter: EditorSelection.range(trimmedFrontMatter.from, trimmedFrontMatter.to),
        markdown: EditorSelection.range(currentMarkdown.from, currentMarkdown.to),
    }
}

/**
 * Get the current markdown selection in the current slide passed.
 * @param editorView The editor view to perform actions in.
 * @param currentSlide The current side to search inside.
 * @returns The selection range; if the cursor is not currently in the markdown
 * section, a range inside the section will be determined automatically.
 */
export function markdownSelectionInSlide(editorView: EditorView, currentSlide: SlideSelection): SelectionRange {
    const { state } = editorView

    if (!currentSlide) {
        const documentEnd = state.doc.length
        return EditorSelection.range(documentEnd, documentEnd)
    }

    const currentSelection = state.selection.main
    const markdownRange = currentSlide.markdown

    const start = Math.max(markdownRange.from, Math.min(markdownRange.to, currentSelection.from))
    const end = Math.min(markdownRange.to, Math.max(markdownRange.from, currentSelection.to))

    return EditorSelection.range(start, end)
}

/*
 * ---------- Finding Lines ----------
 */

/**
 * Check whether there is a line that starts with the given prefix
 * inside the given range.
 * @param start The prefix of the line.
 * @param state The editor state to search in.
 * @param range The range in which search is performed.
 * @returns The line which starts with the given prefix or
 * `undefined` if no line is found.
 */
export function rangeHasLineStartingWith(start: string, state: EditorState, range: SimpleRange): Line | undefined {
    const { doc } = state
    const startLine = doc.lineAt(range.from).number
    const endLine = doc.lineAt(range.to).number

    let currentLine = startLine - 1 // iterator.next starts at first line

    const it = doc.iterLines(startLine, endLine + 1)
    do {
        const line = it.next().value
        currentLine++
        if (line.startsWith(start)) return doc.line(currentLine)
    } while (!it.done)

    return undefined
}

/**
 * Uses `markdownSelectionInSlide` to determine the current selection and
 * then returns the line where the selection starts.
 * @param editorView The editor view to perform actions in.
 * @param currentSlide The current slide to search in.
 * @returns The line where the markdown selection starts
 */
export function currentMarkdownLineInSlide(editorView: EditorView, currentSlide: SlideSelection): Line {
    const { state } = editorView
    const markdownSelection = markdownSelectionInSlide(editorView, currentSlide)

    return state.doc.lineAt(markdownSelection.from)
}

/**
 * Returns the position of the next line that follows 1-n lines
 * that match the given regex query + the first match of the query.
 * @param line The line after which the search should start.
 * @param state The state to search in.
 * @param range The range to search in.
 * @param regexQuery The query to match on.
 * @returns An object consisting of the position of the new
 * line and the result of the first match, or `undefined` if no
 * match was found.
 */
export function nextLineAfterMatches(
    line: Line,
    state: EditorState,
    range: SimpleRange,
    regexQuery: string
): { nextPosition: number; firstMatch: string } | undefined {
    const firstLine = state.doc.line(line.number + 1)
    const firstMatchQuery = firstLine.text.match(regexQuery)
    if (!firstMatchQuery) return undefined
    const firstMatch = firstMatchQuery[0]

    const lastLine = lastLineMatching(state, { from: firstLine.from, to: range.to }, regexQuery)
    if (!lastLine) return undefined

    const nextLine = state.doc.line(lastLine.number + 1)

    return { nextPosition: nextLine.from, firstMatch }
}

/**
 * Returns the last line inside the given range that matches the query.
 * @param state The state to search in.
 * @param range The range to search in.
 * @param regex The regex query used to match lines.
 * @returns The last line matching, `undefined` if no line is found.
 */
export function lastLineMatching(state: EditorState, range: SimpleRange, regex: string): Line | undefined {
    const startLine = state.doc.lineAt(range.from)
    const endLine = state.doc.lineAt(range.to)
    const maxLine = Math.min(endLine.number, state.doc.lines)
    let currentLine = startLine.number - 1
    let lastLine = currentLine

    const it = state.doc.iterLines(startLine.number, maxLine + 1)
    do {
        const value = it.next().value
        currentLine++

        const match = value.match(regex)
        if (match) lastLine = currentLine
    } while (!it.done)

    lastLine = Math.min(maxLine, lastLine)
    return state.doc.line(lastLine)
}

/**
 * Find the last line starting at the position given that is not empty.
 * Optionally, an line offset can be given to enlarge the selection
 * @param state The editor state to search in.
 * @param afterPosition The position after which lines should be searched.
 * @param offset The amount of lines that will be added after the last
 * non-empty line.
 * @returns The last non-empt line + offset if given.
 */
export function lastNonEmptyLine(state: EditorState, afterPosition: number, offset?: number): Line {
    const regexQuery = '^.*\\S+.*$' // match all lines that contain any non-whitespace character
    const maxLines = state.doc.lines

    let lastLine = (
        lastLineMatching(state, { from: afterPosition, to: state.doc.length }, regexQuery) ??
        state.doc.line(afterPosition)
    ).number

    lastLine = Math.min(maxLines, lastLine + (offset ?? 0))
    return state.doc.line(lastLine)
}

/*
 * ---------- Insertion ----------
 */

/**
 * Insert value at the end of the line.
 * @param editorView Editor view to perform actions in.
 * @param value The value to insert.
 * @param line The line at which the value will be inserted
 * @returns The end position of the newly inserted value.
 */
export function insertAtEndOfLine(editorView: EditorView, value: string, line: Line): number {
    const { doc } = editorView.state
    const spacedValue = addSpaceIfNeeded(doc, line.to, value, true, false).newValue
    return insertAtPosition(editorView, spacedValue, line.to)
}

/**
 * Prefix the value passed and insert it on a new line.
 * @param editorView Editor view to perform actions in.
 * @param entry The value to insert.
 * @param from The position where to start inserting.
 * @param prefix The prefix to add.
 * @returns The end position of the newly inserted value.
 */
export function insertLineWithPrefix(editorView: EditorView, entry: string, from: number, prefix: string) {
    return insertAtPosition(editorView, `${prefix}${entry}\n`, from) - 1
}

export function insertLine(editorView: EditorView, value: string, from: number) {
    return insertAtPosition(editorView, `${value}\n`, from + 1) - 1
}

/**
 * Insert value at position.
 * @param editorView The editor view to perform actions in.
 * @param value The value to insert.
 * @param from The position at which to insert.
 * @returns The end position of the inserted value.
 */
export function insertAtPosition(editorView: EditorView, value: string, from: number) {
    editorView.dispatch(
        editorView.state.update({
            changes: {
                from,
                insert: value,
            },
        })
    )

    return from + value.length
}

/**
 * Change the range to the new value.
 * @param editorView The editor view to perform actions in.
 * @param range The range which will be replaced.
 * @param newValue The function used to replace the range.
 * @returns The range containing the changed value.
 */
export function changeInRange(
    editorView: EditorView,
    range: SelectionRange,
    newValue: (oldValue: string, doc: Text) => string
) {
    const currentText = editorView.state.doc.sliceString(range.from, range.to)
    const newText = newValue(currentText, editorView.state.doc)

    editorView.dispatch(
        editorView.state.update({
            changes: {
                from: range.from,
                to: range.to,
                insert: newText,
            },
        })
    )

    return EditorSelection.range(range.from, range.from + newText.length)
}

/**
 * Add a space around the string if needed, by checking if
 * the current position has a preceding or succeding space.
 * @param doc The document to search in.
 * @param position The position which is checked.
 * @param value The value around which spaced will be added.
 * @param leading Whether to make sure there is a leading space.
 * @param trailing Whether to make sure there is a trailing space.
 * @returns The spaced value and the offsets that have been added.
 */
export function addSpaceIfNeeded(
    doc: Text,
    position: number,
    value: string,
    leading: boolean,
    trailing: boolean
): ModifiedString {
    const spaceRegex = '\\s'

    const start = Math.max(0, position - 1)
    const textBefore = doc.sliceString(start, start + 1)
    const textAfter = doc.sliceString(start + 1, start + 2)

    const isSpaceBefore = textBefore.match(spaceRegex)
    const isSpaceAfter = textAfter.match(spaceRegex)

    const leadingOffset = leading && !isSpaceBefore ? 1 : 0
    const trailingOffset = trailing && !isSpaceAfter ? 1 : 0

    const newValue = `${' '.repeat(leadingOffset)}${value}${' '.repeat(trailingOffset)}`

    return { newValue, leadingOffset, trailingOffset }
}

/*
 * ---------- Extract Values ----------
 */

/**
 * Extract attrs string from line if it is found at the end.
 * @param line The line to search in.
 * @returns The original attributes + extracted attributes or
 * `undefined` if no attrs are found.
 */
export function extractLineAttributes(
    line: Line
): { originalAttributes: string; extractedAttributes: string } | undefined {
    const originalQuery = '(?<=^|\\s){[^{}]*}\\s*$' // matches { .attr } at end of line, if at start of line or has a preceding space
    const extractQuery = '(?<={).*(?=})' // matches inner part of { .attr }

    const originalMatch = line.text.match(originalQuery)
    if (!originalMatch) return undefined
    const originalAttributes = originalMatch[0]

    const extractedMatch = originalAttributes.match(extractQuery)
    if (!extractedMatch) return undefined
    const extractedAttributes = extractedMatch[0].trim()

    return { originalAttributes, extractedAttributes }
}

/**
 * If the line is a markdown heading, remove markdown heading tags.
 * @param editorView The editor view to perform actions in.
 * @param line The line which will be searched.
 * @returns The line after it has been modified.
 */
export function removeHeadingFromLine(editorView: EditorView, line: Line): Line {
    const regexQuery = '^#+ *'
    const match = line.text.match(regexQuery)

    if (!match) return line

    const to = line.from + match[0].length
    const newSelection = changeInRange(editorView, EditorSelection.range(line.from, to), () => '')
    return editorView.state.doc.lineAt(newSelection.from)
}

/*
 * ---------- Content Generation ----------
 */

/**
 * Create template for inserting a new slide, with the layout and slots passed.
 * @param layoutName The name of the layout to insert.
 * @param slots The amount of slots for the layout.
 * @returns The string to insert.
 */
export function createNewSlideTemplate(layoutName?: string, slots?: number): { template: string; offset: number } {
    const layoutTag = layoutName ? `layout: ${layoutName}` : ''
    const newSlideTag = `\n\n---\n${layoutTag}\n---\n\n`

    const slotSeparatorsCount = slots && slots > 1 ? slots - 1 : 0
    const slotTags = slots ? `${'\n\n***\n\n'.repeat(slotSeparatorsCount)}` : ''

    const template = `${newSlideTag}${slotTags}`
    const offset = slots ? slotTags.length : 0

    return { template, offset }
}

/*
 * ---------- YAML Format Detection ----------
 */

/**
 * Check whether the given line is the start of a YAML array,
 * i.e., the next line is starting with at least 1 white space character
 * (excluding newline), followed by `- `.
 * @param line The line of the YAML element to check.
 * @param state The editor state to search in.
 * @param range The range in which search is performed.
 * @returns The searched prefix and the position to insert the
 * next value if it is an array, else `undefined`.
 */
export function isYAMLArray(
    line: Line,
    state: EditorState,
    range: SimpleRange
): { nextPosition: number; prefix: string } | undefined {
    // Line starting with at least 1 white space character (excluding newline),
    // followed by a `- `, capture the match
    const regexQuery = '^[^\\S\\r\\n]+- '

    const match = nextLineAfterMatches(line, state, range, regexQuery)

    if (!match) return undefined
    return { nextPosition: match.nextPosition, prefix: match.firstMatch }
}

/**
 * Check whether the given line is the start of a YAML multiline object,
 * i.e., the next line is starting with at least 1 white space character
 * (excluding newline).
 * @param line The line of the YAML element to check.
 * @param state The editor state to search in.
 * @param range The range in which search is performed.
 * @returns The searched prefix and the position to insert the
 * next value if it is an array, else `undefined`.
 */
export function isYAMLMultiline(
    line: Line,
    state: EditorState,
    range: SimpleRange
): { nextPosition: number; prefix: string } | undefined {
    // Line starting with at least 1 white space character (excluding newline),
    // capture the white space characters
    const regexQuery = '^[^\\S\\r\\n]+'
    const match = nextLineAfterMatches(line, state, range, regexQuery)

    if (!match) return undefined
    return { nextPosition: match.nextPosition, prefix: match.firstMatch }
}

/*
 * ---------- Document Navigation ----------
 */

/**
 * Set the cursor of the editor to the position passed.
 * @param editorView The editor view to perform actions in.
 * @param position The position to which the cursor should be set.
 */
export function setCursorPosition(editorView: EditorView, position: number) {
    editorView.dispatch({ selection: { anchor: position, head: position }, scrollIntoView: true })
    editorView.focus()
}

/**
 * Select the range passed in the editor.
 * @param editorView The editor to perform actions in.
 * @param selection The selection that should be selected.
 */
export function selectRange(editorView: EditorView, selection: SelectionRange) {
    editorView.dispatch({
        selection,
    })
}
