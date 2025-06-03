import { getCookie } from 'hono/cookie'
import type { JSX } from 'hono/jsx'
import { createRoute } from 'honox/factory'

import { accessTokenStore, sessionStore } from '../lib/db'

export const GET = createRoute(async (c) => {
    // ----------------------------------------------------------------
    // クエリパラメータから code と state を取得
    // ----------------------------------------------------------------
    const code = c.req.query('code')
    const state = c.req.query('state')
    if (!code || !state) {
        return c.text('Missing code or state', 400)
    }

    // ----------------------------------------------------------------
    // session_idからから復元したstateパラメータを検証
    // ----------------------------------------------------------------
    const sessionId = getCookie(c, 'session_id')
    if (!sessionId) {
        return c.text('Missing session ID', 400)
    }
    const storedState = sessionStore.get(sessionId)
    if (!storedState) {
        return c.text('Invalid session or state not found', 400)
    }
    // state の一致を検証
    if (state !== storedState) {
        return c.text('State mismatch', 400)
    }

    // ----------------------------------------------------------------
    // 認可コードをアクセストークンに交換
    // ----------------------------------------------------------------
    const tokenEndpoint = 'http://localhost:3001/api/token' // トークンエンドポイントのURL
    const clientId = 'your-client-id'
    const clientSecret = 'your-client-secret' // クライアントシークレット（安全に管理する必要があります）
    const redirectUri = 'http://localhost:3000/callback'

    const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        }).toString(),
    })

    if (!tokenResponse.ok) {
        return c.text('Failed to exchange authorization code for access token', 500)
    }

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
        return c.text('Access token not found in response', 500)
    }

    accessTokenStore.set(sessionId, tokenData.access_token)

    return c.render(
        <CallbackCard>
            <p className="mb-6 text-center text-sm text-slate-500">Authorization Code:</p>
            <p className="mb-6 text-center font-mono text-lg text-green-600">{code}</p>
            <p className="mb-6 text-center text-sm text-slate-500">Access Token: (this is a secret)</p>
            <p className="mb-6 text-center font-mono text-lg text-green-600">{tokenData.access_token}</p>
        </CallbackCard>
    )
})

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 以下、無視して良し
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
function CallbackCard({ children }: { children: JSX.HTMLAttributes }) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">Authorization Successful</h1>
                {children}
                <a
                    href="/resource"
                    className="block w-full rounded-lg bg-indigo-400 py-2 text-center text-white transition hover:bg-indigo-500"
                >
                    {'Go to Protected Resource'}
                </a>
            </div>
        </div>
    )
}
