import { protocol } from 'electron'
import { resolve } from 'path'
import { presentationFolderPath, presentationTargets } from '../presentation/presentation'

export const REVEAL_PROTOCOL_NAME = 'reveal'
export const REVEAL_EXPORT_PROTOCOL_NAME = 'reveal-export'

export function registerRevealProtocol() {
    protocol.registerFileProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice('reveal://'.length)
        const allowedPaths = [
            { match: /^presentation\/(#\/\d+)?/, baseFile: presentationTargets.presentation.outFileName },
            { match: /^preview\/(#\/\d+)?/, baseFile: presentationTargets.preview.outFileName },
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

    protocol.registerFileProtocol(REVEAL_EXPORT_PROTOCOL_NAME, (request, callback) => {
        const basePath = resolve(app.getPath('userData'), 'presentation-export')

        const requestedPath = request.url.slice('reveal-export://'.length)
        const allowedPaths = [{ match: /^export\/(\?print-pdf)?/, baseFile: 'presentation.html' }]

        for (const allowed of allowedPaths) {
            if (allowed.match.test(requestedPath)) {
                const trimmedPath = requestedPath.replace(allowed.match, '')
                if (trimmedPath === '') {
                    callback({ path: resolve(basePath, allowed.baseFile) })
                } else {
                    callback({ path: resolve(basePath, trimmedPath) })
                }
                return
            }
        }

        callback({ error: 404 })
    })
}
