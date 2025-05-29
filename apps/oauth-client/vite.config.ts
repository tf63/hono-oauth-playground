import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        port: 3000,
        strictPort: true,
        hmr: {
            port: 3000,
        },
    },
    plugins: [
        honox({
            client: { input: ['./app/style.css'] },
        }),
        tailwindcss(),
    ],
})
