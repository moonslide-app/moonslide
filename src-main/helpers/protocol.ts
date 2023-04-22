import { app, protocol } from 'electron'
import { resolve } from 'path'

export const REVEAL_PROTOCOL_NAME = 'reveal'

export function registerRevealProtocl() {
    protocol.registerFileProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const basePath = resolve(app.getPath('userData'), 'presentation')

        console.log(request.url)
        const requestedPath = request.url.slice('reveal://'.length)
        const allowedPaths = [
            { path: 'presentation/', baseFile: 'presentation.html' },
            { path: 'preview/', baseFile: 'preview.html' },
        ]

        for (const allowed of allowedPaths) {
            if (requestedPath.startsWith(allowed.path)) {
                if (requestedPath === allowed.path) {
                    callback({ path: resolve(basePath, allowed.baseFile) })
                } else {
                    const resolvedPath = requestedPath.slice(allowed.path.length)
                    callback({ path: resolve(basePath, resolvedPath) })
                }
                return
            }
        }

        callback({ error: 404 })
    })
}
