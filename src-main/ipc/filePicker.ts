import { dialog } from 'electron'

export async function selectFile() {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
    })
    return filePaths[0]
}

export async function selectFolder() {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    })
    return filePaths[0]
}

export async function selectOutputFolder() {
    const { filePath } = await dialog.showSaveDialog({
        properties: ['createDirectory'],
    })
    return filePath
}
