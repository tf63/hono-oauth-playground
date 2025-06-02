import { getCookie } from 'hono/cookie'
import { createRoute } from 'honox/factory'

import { sessionStore } from '../lib/db'

export default createRoute((c) => {
    // クエリパラメータから code と state を取得
    const code = c.req.query('code')
    const state = c.req.query('state')

    if (!code || !state) {
        return c.text('Missing code or state', 400)
    }

    // クッキーからセッションIDを取得
    const sessionId = getCookie(c, 'session_id')
    if (!sessionId) {
        return c.text('Missing session ID', 400)
    }

    // セッションストアから保存された state を取得
    const storedState = sessionStore.get(sessionId)
    if (!storedState) {
        return c.text('Invalid session or state not found', 400)
    }

    // state の一致を確認
    if (state !== storedState) {
        return c.text('State mismatch', 400)
    }

    // 認可コードを表示（実際にはここでトークン交換を行う）
    return c.render(
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">Authorization Successful</h1>
                <p className="mb-6 text-center text-sm text-slate-500">Authorization Code:</p>
                <p className="mb-6 text-center font-mono text-lg text-green-600">{code}</p>
                <a
                    href="/"
                    className="block w-full rounded-lg bg-indigo-400 py-2 text-center text-white transition hover:bg-indigo-500"
                >
                    Back to Home
                </a>
            </div>
        </div>
    )
})
