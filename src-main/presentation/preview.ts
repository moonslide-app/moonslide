import { BrowserWindow } from 'electron'

let currentPreviewWindow: BrowserWindow | undefined = undefined
export function openPreviewWindow() {
    if (currentPreviewWindow) currentPreviewWindow.destroy()

    const previewWindow = new BrowserWindow({
        width: 1280,
        height: 800,
    })

    previewWindow.loadURL('reveal://preview-fullscreen/')
    currentPreviewWindow = previewWindow
}

export function reloadPreviewWindow() {
    if (currentPreviewWindow && !currentPreviewWindow.isDestroyed()) {
        currentPreviewWindow?.webContents.reload()
    }
}
