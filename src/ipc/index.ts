import { contextBridge } from 'electron'
import files from './files'
import presentation from './presentation'
import menu from './menu'

declare global {
    interface Window {
        ipc: typeof ipc
    }
}

const ipc = { files, presentation, menu } as const

export function registerIpc() {
    contextBridge.exposeInMainWorld('ipc', ipc)
}
