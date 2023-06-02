import { app, protocol } from 'electron'
import { resolve } from 'path'
import { presentationStore } from '../store'

export const REVEAL_PROTOCOL_NAME = 'reveal'
export const FILE_PROTOCOL_NAME = 'reveal-file'

export const previewFolderPath = resolve(app.getPath('userData'), 'preview')

export const previewTargets = {
    small: 'preview.html',
    fullscreen: 'presentation.html',
}

export function registerProtocols() {
    protocol.registerStringProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${REVEAL_PROTOCOL_NAME}://`.length)
        const registeredPaths = [
            { match: /^preview(.*)/, content: presentationStore.parsedPresentation?.previewHtml },
            { match: /^export(.*)/, content: presentationStore.parsedPresentation?.previewHtml },
        ]

        for (const registeredPath of registeredPaths) {
            if (registeredPath.match.test(requestedPath)) {
                callback({ data: registeredPath.content })
                return
            }
        }

        callback({ error: 404 })
    })

    protocol.registerFileProtocol(FILE_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${FILE_PROTOCOL_NAME}://`.length)
        callback({ path: requestedPath })
    })
}

export function getFileSchemeUrlFromFileProtocol(url: string): string {
    return 'file' + url.slice(FILE_PROTOCOL_NAME.length)
}

export function getLocalFileUrl(absolutePath: string): string {
    return `${FILE_PROTOCOL_NAME}://${absolutePath}`
}
