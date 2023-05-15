import { dialog } from 'electron'
import { readFile, writeFile } from 'fs/promises'

/**
 * Asks the user if they want to save the changes in the document.
 * The promise:
 * - succeeds with `true` if the changes should be saved.
 * - succeeds with `false` if the changes should be discarded.
 * - is rejected if the action is cancelled.
 */
export async function saveChangesDialog(): Promise<boolean> {
    const { response } = await dialog.showMessageBox({
        type: 'warning',
        message: 'There are unsaved changes in the editing file. Would you like to save them?',
        buttons: ['Save', 'Discard', 'Cancel'],
    })
    if (response === 0) return true
    else if (response === 1) return false
    else throw new Error('Save changes dialog was cancelled.')
}

export async function selectFile(filters?: Electron.FileFilter[]): Promise<string> {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters,
    })
    if (filePaths[0] !== undefined) return filePaths[0]
    else throw new Error('No file was selected.')
}

export async function selectFolder(): Promise<string> {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    })
    if (filePaths[0] !== undefined) return filePaths[0]
    else throw new Error('No folder was selected.')
}

export async function selectOutputFile(filters?: Electron.FileFilter[]): Promise<string> {
    const { filePath } = await dialog.showSaveDialog({
        properties: ['createDirectory'],
        filters,
    })
    if (filePath !== undefined) return filePath
    else throw new Error('No output file was selected.')
}

export async function selectOutputFolder(): Promise<string | undefined> {
    const { filePath } = await dialog.showSaveDialog({
        properties: ['createDirectory'],
    })
    if (filePath !== undefined) return filePath
    else throw new Error('No output folder was selected.')
}

export async function getFileContent(filePath: string): Promise<string> {
    return (await readFile(filePath)).toString()
}

export async function saveFile(filePath: string, content: string): Promise<void> {
    await writeFile(filePath, content)
}
