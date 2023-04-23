import { defineConfig } from 'vite'
import { restart } from './vite.hotfix'

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
        browserField: false,
        mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
    plugins: [restart()],
})
