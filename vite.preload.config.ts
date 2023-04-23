import { defineConfig } from 'vite'
import { restart } from './vite.hotfix'

// https://vitejs.dev/config
export default defineConfig({
    plugins: [restart()],
})
