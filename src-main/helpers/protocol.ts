import { app, protocol } from 'electron'
import { resolve } from 'path'

export const REVEAL_PROTOCOL_NAME = 'reveal'
export const REVEAL_EXPORT_PROTOCOL_NAME = 'reveal-export'

export function registerRevealProtocl() {
    protocol.registerFileProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const basePath = resolve(app.getPath('userData'), 'presentation')

        const requestedPath = request.url.slice('reveal://'.length)
        const allowedPaths = [
            { match: /^presentation\/(#\/\d+)?/, baseFile: 'presentation.html' },
            { match: /^preview\/(#\/\d+)?/, baseFile: 'preview.html' },
        ]

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
