import { protocol } from 'electron'
import { resolve } from 'path'
import { presentationFolderPath, presentationTargets } from '../presentation/presentation'

export const REVEAL_PROTOCOL_NAME = 'reveal'
export const IMAGE_PROTOCOL_NAME = 'image'

export function registerProtocols() {
    protocol.registerFileProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${REVEAL_PROTOCOL_NAME}://`.length)
        const allowedPaths = [
            { match: /^presentation\/(#\/\d+)?/, baseFile: presentationTargets.presentation.outFileName },
            { match: /^preview\/(#\/\d+)?/, baseFile: presentationTargets.preview.outFileName },
            { match: /^export\/(\?print-pdf)?/, baseFile: presentationTargets.presentation.outFileName },
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
