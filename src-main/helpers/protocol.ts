import { app, protocol } from 'electron'
import { resolve } from 'path'

export const REVEAL_PROTOCOL_NAME = 'reveal'

export function registerRevealProtocl() {
    protocol.registerFileProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const basePath = resolve(app.getPath('userData'), 'presentation')

        const requestedPath = request.url.slice('reveal://'.length)
        const allowedPaths = [
            { match: /^presentation\/(#\/\d+)?/, baseFile: 'presentation.html' },
            { match: /^preview\/(#\/\d+)?/, baseFile: 'preview.html' },
        ]
        console.log(`Requested path: ${requestedPath}`)

        for (const allowed of allowedPaths) {
            if (allowed.match.test(requestedPath)) {
                const trimmedPath = requestedPath.replace(allowed.match, '')
                console.log(`Trimmed path: ${trimmedPath}`)
                if (trimmedPath === '') {
                    callback({ path: resolve(basePath, allowed.baseFile) })
                } else {
                    callback({ path: resolve(basePath, trimmedPath) })
                }
                return
            }
        }
        console.log(`Not found!`)
        callback({ error: 404 })
    })
}
