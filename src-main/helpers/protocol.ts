import { protocol } from 'electron'
import { resolve } from 'path'
import { presentationFolderPath, presentationTargets } from '../presentation/presentation'

export const REVEAL_PROTOCOL_NAME = 'reveal'

export function registerRevealProtocl() {
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
}
