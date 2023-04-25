import { contextBridge } from 'electron'
import files from './files'
import presentation from './presentation'

declare global {
    interface Window {
        ipc: typeof ipc
    }
}

const ipc = { files, presentation } as const

export function registerIpc() {
    contextBridge.exposeInMainWorld('ipc', ipc)
}
