import { webFrame } from 'electron'

const webFrameConnector = {
    clearCache() {
        webFrame.clearCache()
    },
}

export default webFrameConnector
