import { shell, Menu, BrowserWindow } from 'electron'
import { presentationStore } from '../store'

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
                    submenu: [
                        {
                            label: 'PDF',
                            accelerator: isMac ? 'Cmd+E' : 'Ctrl+E',
                            click: () => window.webContents.send('menu:export-pdf'),
                        },
                        {
                            label: 'HTML Presentation Bundle',
                            accelerator: isMac ? 'Shift+Cmd+E' : 'Shift+Ctrl+E',
                            click: () => window.webContents.send('menu:export-presentation-bundle'),
                        },
                        {
                            label: 'HTML Presentation Only',
                            accelerator: isMac ? 'Alt+Cmd+E' : 'Alt+Ctrl+E',
                            click: () => window.webContents.send('menu:export-presentation-only'),
                        },
                    ],
                },
                {
                    label: 'Create Template',
                    click: () => window.webContents.send('menu:create-template'),
                },
                { type: 'separator' },
                {
                    label: isMac ? 'Reveal in Finder' : 'Reveal in File Explorer',
                    accelerator: isMac ? 'Alt+Cmd+R' : 'Alt+Ctrl+R',
                    click: () => {
                        const markdownFile = presentationStore.parsedPresentation?.resolvedPaths.markdownFile
                        if (markdownFile) shell.showItemInFolder(markdownFile)
                    },
                },
                {
                    label: isMac ? 'Reveal Template in Finder' : 'Reveal Template in File Explorer',
                    click: () => {
                        const templateFolder = presentationStore.parsedPresentation?.resolvedPaths.templateFolder
                        if (templateFolder) shell.showItemInFolder(templateFolder)
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
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
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
                        await shell.openExternal('https://github.com/moonslide-app/moonslide')
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
