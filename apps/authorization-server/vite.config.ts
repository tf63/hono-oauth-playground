import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        port: 3001,
        strictPort: true,
        hmr: {
            port: 3001,
        },
    },
    plugins: [
        honox({
            client: { input: ['./app/style.css'] },
        }),
        tailwindcss(),
    ],
})
