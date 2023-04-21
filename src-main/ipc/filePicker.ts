import { dialog } from 'electron'
import { readFile, writeFile } from 'fs/promises'

export async function selectFile(): Promise<string | undefined> {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
    })
    return filePaths[0]
}

export async function selectFolder(): Promise<string | undefined> {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    })
    return filePaths[0]
}

export async function selectOutputFolder(): Promise<string | undefined> {
    const { filePath } = await dialog.showSaveDialog({
        properties: ['createDirectory'],
    })
    return filePath
}

export async function getFileContent(filePath: string): Promise<string> {
    return (await readFile(filePath)).toString()
}

export async function saveFile(filePath: string, content: string): Promise<void> {
    await writeFile(filePath, content)
}
