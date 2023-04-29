import { app, protocol } from 'electron'
import { resolve } from 'path'

export const REVEAL_PROTOCOL_NAME = 'reveal'
export const IMAGE_PROTOCOL_NAME = 'image'

export const previewFolderPath = resolve(app.getPath('userData'), 'preview')

export const previewTargets = {
    small: 'preview.html',
    fullscreen: 'presentation.html',
}

export function registerProtocols() {
    protocol.registerFileProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${REVEAL_PROTOCOL_NAME}://`.length)
        const allowedPaths = [
            { match: /^preview-fullscreen\/((#\/)(\d+\/?)*)?/, baseFile: previewTargets.fullscreen },
            { match: /^preview-small\/((#\/)(\d+\/?)*)?/, baseFile: previewTargets.small },
            { match: /^export\/(\?print-pdf)?/, baseFile: previewTargets.fullscreen },
        ]

        for (const allowed of allowedPaths) {
            if (allowed.match.test(requestedPath)) {
                const trimmedPath = requestedPath.replace(allowed.match, '')
                if (trimmedPath === '') {
                    console.log(`Base File Request to: ${request.url}`)
                    callback({ path: resolve(previewFolderPath, allowed.baseFile) })
                } else {
                    callback({ path: resolve(previewFolderPath, trimmedPath) })
                }
                return
            }
        }
        console.warn('Could not handle request:')
        console.log(request)
        callback({ error: 404 })
    })

    protocol.registerFileProtocol(IMAGE_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${IMAGE_PROTOCOL_NAME}://`.length)
        callback({ path: requestedPath })
    })
}

export function getLocalImageUrl(absolutePath: string): string {
    return `${IMAGE_PROTOCOL_NAME}://${absolutePath}`
}
