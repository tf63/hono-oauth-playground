import { jsxRenderer } from 'hono/jsx-renderer'
import { Link } from 'honox/server'

export default jsxRenderer(({ children }) => {
    return (
        <html lang="ja">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="/favicon.ico" />
                <Link href="/app/style.css" rel="stylesheet" />
            </head>
            <body className="min-h-screen bg-gray-50">{children}</body>
        </html>
    )
})
