import { app, protocol } from 'electron'
import { resolve } from 'path'

export const REVEAL_PROTOCOL_NAME = 'reveal'
export const FILE_PROTOCOL_NAME = 'reveal-file'

export const previewFolderPath = resolve(app.getPath('userData'), 'preview')

export const previewTargets = {
    small: 'preview.html',
    fullscreen: 'presentation.html',
}

export function registerProtocols() {
    protocol.registerFileProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${REVEAL_PROTOCOL_NAME}://`.length)
        const allowedPaths = [
            { match: /^preview-fullscreen(.*)/, baseFile: previewTargets.fullscreen },
            { match: /^preview-small(.*)/, baseFile: previewTargets.small },
            { match: /^export(.*)/, baseFile: previewTargets.fullscreen },
        ]

        for (const allowed of allowedPaths) {
            if (allowed.match.test(requestedPath)) {
                callback({ path: resolve(previewFolderPath, allowed.baseFile) })
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

export function getLocalFileUrl(absolutePath: string): string {
    return `${FILE_PROTOCOL_NAME}://${absolutePath}`
}
