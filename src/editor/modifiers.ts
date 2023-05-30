import { imageFilter } from '../store/FileFilters'
import { CodeMirrorEditorRef } from '../components/CodeMirrorEditor'

export function formatStrong(editor: CodeMirrorEditorRef) {
    editor.onAddFormat('**')
}

export function formatEmphasize(editor: CodeMirrorEditorRef) {
    editor.onAddFormat('*')
}

export function formatStrikethrough(editor: CodeMirrorEditorRef) {
    editor.onAddFormat('~~')
}

export function formatLink(editor: CodeMirrorEditorRef) {
    editor.onAddFormat('[', '](https://')
}

export function formatCodeInline(editor: CodeMirrorEditorRef) {
    editor.onAddFormat('`')
}

export function formatCodeBlock(editor: CodeMirrorEditorRef) {
    editor.onAddFormat('\n```\n')
}

export function formatMathInline(editor: CodeMirrorEditorRef) {
    editor.onAddFormat('$')
}

export function formatMathBlock(editor: CodeMirrorEditorRef) {
    editor.onAddFormat('\n$$\n')
}

export function blockH1(editor: CodeMirrorEditorRef) {
    editor.onAddBlock('# ')
}

export function blockH2(editor: CodeMirrorEditorRef) {
    editor.onAddBlock('## ')
}

export function blockH3(editor: CodeMirrorEditorRef) {
    editor.onAddBlock('### ')
}

export function blockH4(editor: CodeMirrorEditorRef) {
    editor.onAddBlock('#### ')
}

export function blockOl(editor: CodeMirrorEditorRef) {
    editor.onAddBlock('1. ')
}

export function blockUl(editor: CodeMirrorEditorRef) {
    editor.onAddBlock('- ')
}

export function blockTaskList(editor: CodeMirrorEditorRef) {
    editor.onAddBlock('- [ ] ')
}

export function blockBlockquote(editor: CodeMirrorEditorRef) {
    editor.onAddBlock('> ')
}

export async function selectMedia(editor: CodeMirrorEditorRef) {
    const filePath = await window.ipc.files.selectFile('Open Presentation', [imageFilter])
    editor.onAddMedia(filePath)
}
