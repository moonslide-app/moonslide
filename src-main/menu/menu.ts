import { shell, Menu } from 'electron'

const isMac = process.platform === 'darwin'

const template: Electron.MenuItemConstructorOptions[] = [
    { role: 'appMenu' },
    {
        role: 'fileMenu',
        submenu: [
            {
                label: 'New',
                accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
                click: () => {
                    console.log('New Presentation')
                },
            },
            {
                label: 'Open',
                accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
                click: () => {
                    console.log('Open Presentation')
                },
            },
            {
                label: 'Save',
                accelerator: isMac ? 'Cmd+S' : 'Ctrl+S',
                click: () => {
                    console.log('Save')
                },
            },
            {
                label: 'Save as',
                accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
                click: () => {
                    console.log('Save as')
                },
            },
            { type: 'separator' },
            {
                label: 'Export',
                accelerator: isMac ? 'Cmd+E' : 'Ctrl+E',
                submenu: [
                    {
                        label: 'PDF',
                        click: () => {
                            console.log('Export PDF')
                        },
                    },
                    {
                        label: 'HTML Presentation Bundle',
                        click: () => {
                            console.log('Export Presentation Bundle')
                        },
                    },
                    {
                        label: 'HTML Presentation Only',
                        click: () => {
                            console.log('Export Presentaion Only')
                        },
                    },
                ],
            },
            {
                label: 'Create Template',
                click: () => {
                    console.log('Create New Template')
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
                click: () => {
                    console.log('undo')
                },
            },
            {
                label: 'Redo',
                accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Shift+Z',
                click: () => {
                    console.log('redo')
                },
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
                label: 'Show Presentation Window',
                accelerator: isMac ? 'Cmd+Enter' : 'Ctrl+Enter',
                click: () => {
                    console.log('show presentation window')
                },
            },
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
    },
    {
        role: 'windowMenu',
    },
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

export function setupMenu() {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
