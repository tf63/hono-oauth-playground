import { setCookie } from 'hono/cookie'
import { createRoute } from 'honox/factory'
import { nanoid } from 'nanoid'

import { sessionStore } from '../lib/db'

export default createRoute((c) => {
    return c.render(
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">OAuth Sample</h1>
                <p className="mb-6 text-center text-sm text-slate-500">認可サーバーにリダイレクトされます</p>
                <form method="post">
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-400 py-2 text-white transition hover:bg-indigo-500"
                    >
                        {'Go to Authorization Server'}
                    </button>
                </form>
            </div>
        </div>
    )
})

export const POST = createRoute((c) => {
    // ランダムな state 値を生成
    const state = nanoid()

    // セッションストアに state を保存
    const sessionId = nanoid() // セッションIDを生成
    sessionStore.set(sessionId, state)

    setCookie(c, 'session_id', sessionId, {
        httpOnly: true,
    })

    const params = new URLSearchParams({
        client_id: 'your-client-id', // クライアントID
        redirect_uri: 'http://localhost:3000/callback', // リダイレクト先
        response_type: 'code', // レスポンスタイプ
        scope: 'hoge', // スコープ
        state, // CSRF 対策用のstateパラメータ
    })

    const authorizationUrl = `http://localhost:3001/login?${params.toString()}`

    return c.redirect(authorizationUrl)
})
