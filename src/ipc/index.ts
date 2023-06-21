import { contextBridge } from 'electron'
import files from './files'
import presentation from './presentation'
import menu from './menu'
import os from './os'
import webFrameConnector from './webFrameConntector'

declare global {
    interface Window {
        ipc: typeof ipc
    }
}

const ipc = { files, presentation, menu, os, webFrameConnector } as const

export function registerIpc() {
    contextBridge.exposeInMainWorld('ipc', ipc)
}
