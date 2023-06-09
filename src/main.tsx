import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/globals.css'

addPlatformClass()
setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    setDarkMode(event.matches)
})

function setDarkMode(dark: boolean) {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
}

function addPlatformClass() {
    const platform = window.ipc.os.isMac
        ? 'macos'
        : window.ipc.os.isWindows
        ? 'windows'
        : window.ipc.os.isLinux
        ? 'linux'
        : undefined

    if (platform) document.documentElement.classList.add(platform)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
