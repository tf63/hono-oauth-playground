import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        port: 3002,
        strictPort: true,
        hmr: {
            port: 3002,
        },
    },
    plugins: [honox(), tailwindcss()],
})
