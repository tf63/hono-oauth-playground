import { getCookie } from 'hono/cookie'
import type { JSX } from 'hono/jsx'
import { createRoute } from 'honox/factory'

import { accessTokenStore } from '../lib/db'

const RESOURCE_SERVER = 'http://localhost:3002' // リソースサーバーのURL

export const GET = createRoute(async (c) => {
    // ----------------------------------------------------------------
    // クエリパラメータからアクセストークンを取得
    // ----------------------------------------------------------------
    const sessionId = getCookie(c, 'session_id')
    if (!sessionId) {
        return c.text('Session ID not found', 400)
    }
    const accessToken = accessTokenStore.get(sessionId)
    if (!accessToken) {
        return c.text('Access token is required', 400)
    }

    // ----------------------------------------------------------------
    // リソースサーバーからデータを取得
    // ----------------------------------------------------------------
    const resourceResponse = await fetch(`${RESOURCE_SERVER}/api/resource`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!resourceResponse.ok) {
        return c.text('Failed to fetch resource', 500)
    }

    const resourceData = await resourceResponse.json()

    // ----------------------------------------------------------------
    // データを表示
    // ----------------------------------------------------------------
    return c.render(
        <ResourceCard>
            <pre className="overflow-auto rounded-lg bg-gray-100 p-4">{JSON.stringify(resourceData, null, 2)}</pre>
        </ResourceCard>
    )
})

// ----------------------------------------------------------------
// 以下、無視して良し
// ----------------------------------------------------------------
function ResourceCard({ children }: { children: JSX.HTMLAttributes }) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <h2 className="mb-4 text-center text-xl font-bold">Protected Resource</h2>
                {children}

                <a
                    href="/"
                    className="mt-5 block w-full rounded-lg bg-indigo-400 py-2 text-center text-white transition hover:bg-indigo-500"
                >
                    Back to Home
                </a>
            </div>
        </div>
    )
}
