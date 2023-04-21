import { contextBridge } from 'electron'
import files from './files'

declare global {
    interface Window {
        ipc: typeof ipc
    }
}

const ipc = { files } as const

export function registerIpc() {
    contextBridge.exposeInMainWorld('ipc', ipc)
}
