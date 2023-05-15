import { ipcRenderer } from 'electron'

function createCallback<Args extends Array<unknown> = []>(event: string) {
    return (callback: (...args: Args) => unknown | Promise<unknown>) =>
        ipcRenderer.on(event, (_, ...args) => callback(...(args as Args)))
}

const menu = {
    onNew: createCallback('menu:new'),
    onOpen: createCallback('menu:open'),
    onSave: createCallback('menu:save'),
    onSaveAs: createCallback('menu:saveAs'),
    onExportPdf: createCallback('menu:export-pdf'),
    onExportPresentationBundle: createCallback('menu:export-presentation-bundle'),
    onExportPresentationOnly: createCallback('menu:export-presentation-only'),
    onUndo: createCallback('menu:undo'),
    onRedo: createCallback('menu:redo'),
    onReloadPreviews: createCallback('menu:reload-previews'),
} as const

export default menu
