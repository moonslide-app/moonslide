import { shell, Menu, BrowserWindow, app } from 'electron'
import { TEMPLATE_STANDARD, getTemplateFolder } from '../helpers/assets'
import { selectOutputFolder } from '../helpers/files'
import { loadTemplate } from '../presentation/template'

const isMac = process.platform === 'darwin'

export function buildTemplate(window: BrowserWindow): Electron.MenuItemConstructorOptions[] {
    return [
        { role: 'appMenu' },
        {
            role: 'fileMenu',
            submenu: [
                {
                    label: 'New',
                    accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
                    click: () => window.webContents.send('menu:new'),
                },
                {
                    label: 'Open',
                    accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
                    click: () => window.webContents.send('menu:open'),
                },
                {
                    label: 'Save',
                    accelerator: isMac ? 'Cmd+S' : 'Ctrl+S',
                    click: () => window.webContents.send('menu:save'),
                },
                {
                    label: 'Save as',
                    accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
                    click: () => window.webContents.send('menu:saveAs'),
                },
                { type: 'separator' },
                {
                    label: 'Export',
                    accelerator: isMac ? 'Cmd+E' : 'Ctrl+E',
                    submenu: [
                        {
                            label: 'PDF',
                            click: () => window.webContents.send('menu:export-pdf'),
                        },
                        {
                            label: 'HTML Presentation Bundle',
                            click: () => window.webContents.send('menu:export-presentation-bundle'),
                        },
                        {
                            label: 'HTML Presentation Only',
                            click: () => window.webContents.send('menu:export-presentation-only'),
                        },
                    ],
                },
                {
                    label: 'Create Template',
                    click: async () => {
                        const outFolder = await selectOutputFolder('Create Template')
                        const templateFolder = getTemplateFolder(TEMPLATE_STANDARD)
                        const template = await loadTemplate(templateFolder)
                        template.copyTo(outFolder)
                    },
                },
            ],
        },
        {
            role: 'editMenu',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: isMac ? 'Cmd+Z' : 'Ctrl+Z',
                    click: () => window.webContents.send('menu:undo'),
                },
                {
                    label: 'Redo',
                    accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Shift+Z',
                    click: () => window.webContents.send('menu:redo'),
                },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
                { type: 'separator' },
            ],
        },
        {
            role: 'viewMenu',
            submenu: [
                {
                    label: 'Open Preview Window',
                    accelerator: isMac ? 'Cmd+Enter' : 'Ctrl+Enter',
                    click: () => window.webContents.send('menu:open-previews'),
                },
                {
                    label: 'Reload All Previews',
                    accelerator: isMac ? 'Cmd+R' : 'Ctrl+R',
                    click: () => window.webContents.send('menu:reload-previews'),
                },
                { type: 'separator' },
                ...(!app.isPackaged
                    ? ([{ role: 'forceReload' }, { role: 'toggleDevTools' }, { type: 'separator' }] as const)
                    : []),
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                ...(isMac ? ([{ role: 'close' }] as const) : []),
                { role: 'togglefullscreen' },
            ],
        },
        { role: 'windowMenu' },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        // TODO: Change to correct url
                        await shell.openExternal('https://github.com/reveal-editor/reveal-editor')
                    },
                },
            ],
        },
    ]
}

export function setupMenu(window: BrowserWindow) {
    const template = buildTemplate(window)
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
