import { getCookie, setCookie } from 'hono/cookie'
import type { JSX } from 'hono/jsx'
import { createRoute } from 'honox/factory'
import { nanoid } from 'nanoid'

import { sessionStore } from '../lib/db'

const CLIENT_SERVER = 'http://localhost:3000' // クライアントサーバー
const AUTHORIZATION_SERVER = 'http://localhost:3001' // 認可サーバー
const AUTHORIZATION_SCOPE = 'hoge foo' // 認可サーバーのスコープ

export const GET = createRoute((c) => {
    // ----------------------------------------------------------------
    // セッションIDを発行
    // ----------------------------------------------------------------
    const sessionId = nanoid()
    setCookie(c, 'session_id', sessionId, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: true,
    })
    // sameSiteをつけてもlocalhost:3000 -> localhost:3001ではcookieが送信されるので注意
    return c.render(
        <ClientCard>
            <form method="post">
                <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-400 py-2 text-white transition hover:bg-indigo-500"
                >
                    {'Go to Authorization Server'}
                </button>
            </form>
        </ClientCard>
    )
})

export const POST = createRoute((c) => {
    // ----------------------------------------------------------------
    // セッションIDを作成 (stateと紐付けて保存)
    // ----------------------------------------------------------------
    const sessionId = getCookie(c, 'session_id')
    if (!sessionId) {
        return c.text('Session ID not found', 400)
    }

    const state = nanoid() // CSRF対策用のstateパラメータ
    sessionStore.set(sessionId, state)

    // ----------------------------------------------------------------
    // 認可サーバーの認可エンドポイントにリダイレクト
    // ----------------------------------------------------------------
    const params = new URLSearchParams({
        client_id: 'your-client-id', // クライアントID
        redirect_uri: `${CLIENT_SERVER}/callback`, // リダイレクト先
        response_type: 'code', // レスポンスタイプ
        scope: AUTHORIZATION_SCOPE, // スコープ
        state,
    })

    return c.redirect(`${AUTHORIZATION_SERVER}/login?${params.toString()}`)
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
function ClientCard({ children }: { children: JSX.HTMLAttributes }) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">OAuth Sample</h1>
                <p className="mb-6 text-center text-sm text-slate-500">認可サーバーにリダイレクトされます</p>
                {children}
            </div>
        </div>
    )
}
