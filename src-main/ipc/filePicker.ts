import { dialog } from 'electron'

export async function selectMarkdownFile() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Markdown', extensions: ['md', '.txt'] }],
    })

    if (canceled) {
        return
    }

    return filePaths[0]
}
