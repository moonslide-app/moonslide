import { protocol } from 'electron'
import { presentationStore } from '../store'
import { parse } from 'url'

export const REVEAL_PROTOCOL_NAME = 'reveal'
export const FILE_PROTOCOL_NAME = 'reveal-file'

export function registerProtocols() {
    protocol.registerStringProtocol(REVEAL_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${REVEAL_PROTOCOL_NAME}://`.length)
        const allowedPath = /^preview(.*)/
        if (requestedPath.match(allowedPath)) {
            callback({ data: presentationStore.parsedPresentation?.previewHtml })
        } else {
            callback({ error: 404 })
        }
    })

    protocol.registerFileProtocol(FILE_PROTOCOL_NAME, (request, callback) => {
        const requestedPath = request.url.slice(`${FILE_PROTOCOL_NAME}://`.length)
        if (requestedPath.length > 0) {
            const decoded = decodeURI(requestedPath)
            callback({ path: decoded })
        } else callback({ error: 404 })
    })
}

export function getFileSchemeUrlFromFileProtocol(url: string): string {
    return 'file://' + parse(url).pathname
}

export function getLocalFileUrl(absolutePath: string): string {
    return `${FILE_PROTOCOL_NAME}://${absolutePath}`
}
