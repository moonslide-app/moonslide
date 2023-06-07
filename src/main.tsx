import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/globals.css'

setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    setDarkMode(event.matches)
})

function setDarkMode(dark: boolean) {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
