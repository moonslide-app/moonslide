import { app, protocol } from 'electron'
import { resolve } from 'path'

export const REVEAL_PROTOCOL_NAME = 'reveal'
export const IMAGE_PROTOCOL_NAME = 'image'

export const presentationFolderPath = resolve(app.getPath('userData'), 'presentation')

export const presentationTargets = {
    preview: 'preview.html',
    presentation: 'presentation.html',
}

export function registerProtocols() {
    protocol.registerFileProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${REVEAL_PROTOCOL_NAME}://`.length)
        const allowedPaths = [
            { match: /^presentation\/(#\/\d+)?/, baseFile: presentationTargets.presentation },
            { match: /^preview\/(#\/\d+)?/, baseFile: presentationTargets.preview },
            { match: /^export\/(\?print-pdf)?/, baseFile: presentationTargets.presentation },
        ]

        for (const allowed of allowedPaths) {
            if (allowed.match.test(requestedPath)) {
                const trimmedPath = requestedPath.replace(allowed.match, '')
                if (trimmedPath === '') {
                    callback({ path: resolve(presentationFolderPath, allowed.baseFile) })
                } else {
                    callback({ path: resolve(presentationFolderPath, trimmedPath) })
                }
                return
            }
        }

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
