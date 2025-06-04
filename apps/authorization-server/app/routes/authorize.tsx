import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import type { JSX } from 'hono/jsx'
import { createRoute } from 'honox/factory'
import { nanoid } from 'nanoid'

import { type AuthorizationInfo, authorizationStore, sessionStore } from '../lib/db'

export const GET = createRoute((c) => {
    const params = getParams(c)
    return c.render(
        <AuthorizeCard c={c}>
            <form method="post">
                <input type="hidden" name="clientId" value={params.clientId} />
                <input type="hidden" name="redirectUri" value={params.redirectUri} />
                <input type="hidden" name="responseType" value={params.responseType} />
                <input type="hidden" name="scope" value={params.scope} />
                <input type="hidden" name="state" value={params.state} />
                <button
                    type="submit"
                    className="w-full rounded-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
                >
                    Approve
                </button>
            </form>
        </AuthorizeCard>
    )
})

export const POST = createRoute(async (c) => {
    const { state, clientId, redirectUri, scope } = await c.req.parseBody<AuthorizeParamsType>()

    // ----------------------------------------------------------------
    // セッションIDからユーザーを取得
    // ----------------------------------------------------------------
    const username = getUsernameFromSession(c)
    if (!username) {
        return c.text('Invalid session or user not found', 400)
    }

    // ----------------------------------------------------------------
    // 認可情報の作成。 認可サーバーで保持しておき、後でアクセストークンを検証するために使用する
    // ----------------------------------------------------------------
    const expiredAt = Date.now() + 60 * 60 * 1000 // 認可コードの有効期限
    const authorizationInfo = {
        clientId,
        redirectUri,
        scope,
        username,
        expiredAt: expiredAt.toString(),
    } satisfies AuthorizationInfo

    // ----------------------------------------------------------------
    // 認可コードを生成し、認可情報を保存
    // ----------------------------------------------------------------
    const code = nanoid()
    // アクセストークンの検証のため、認可サーバーに認可情報を保存する
    authorizationStore.set(code, authorizationInfo)

    // ----------------------------------------------------------------
    // 認可コードとstateパラメータを付与してクライアントにリダイレクト
    // ----------------------------------------------------------------
    const params = new URLSearchParams({
        code,
        state: state,
    })
    return c.redirect(`${redirectUri}?${params.toString()}`)
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
function getUsernameFromSession(c: Context): string | null {
    const sessionId = getCookie(c, 'auth_session_id')
    if (!sessionId) return null

    const username = sessionStore.get(sessionId)
    return username || null
}

export function getParams(c: Context) {
    const clientId = c.req.query('client_id') || ''
    const redirectUri = c.req.query('redirect_uri') || ''
    const responseType = c.req.query('response_type') || ''
    const scope = c.req.query('scope') || ''
    const state = c.req.query('state') || ''

    return { clientId, redirectUri, responseType, scope, state }
}

export type AuthorizeParamsType = ReturnType<typeof getParams>

function AuthorizeCard({ c, children }: { c: Context; children: JSX.HTMLAttributes }) {
    const params = getParams(c)

    return (
        <div className="flex min-h-screen items-center justify-center gap-16 bg-gray-900 text-white">
            <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">Authorize Access</h1>
                <p className="mb-4 text-center text-sm text-gray-400">
                    <strong>{params.clientId}</strong> がリソースへのアクセスを求めています
                </p>
                <p className="mb-6 text-center text-sm text-gray-400">
                    Requested permissions: <strong>{params.scope}</strong>
                </p>
                {children}
            </div>
        </div>
    )
}
