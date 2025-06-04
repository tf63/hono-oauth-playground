import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import type { JSX } from 'hono/jsx'
import { createRoute } from 'honox/factory'
import { nanoid } from 'nanoid'

import { sessionStore } from '../lib/db'
import { type AuthorizeParamsType, getParams } from './authorize'

const USER_NAME = 'user'
const USER_PASSWORD = 'password'

export const GET = createRoute((c) => {
    const params = getParams(c)
    return c.render(
        <LoginCard c={c}>
            <form method="post">
                <input type="hidden" name="clientId" value={params.clientId} />
                <input type="hidden" name="redirectUri" value={params.redirectUri} />
                <input type="hidden" name="responseType" value={params.responseType} />
                <input type="hidden" name="scope" value={params.scope} />
                <input type="hidden" name="state" value={params.state} />

                <UserNameInput />
                <PasswordInput />

                <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-400 py-2 text-white transition hover:bg-indigo-500"
                >
                    Log In
                </button>
            </form>
        </LoginCard>
    )
})

export const POST = createRoute(async (c) => {
    const body = await c.req.parseBody<
        AuthorizeParamsType & {
            username: string
            password: string
        }
    >()
    const { username, password, clientId, redirectUri, responseType, scope, state } = body

    // ----------------------------------------------------------------
    // ユーザー名とパスワードの検証
    // ----------------------------------------------------------------
    if (username !== USER_NAME || password !== USER_PASSWORD) {
        // 認証失敗
        // エラーメッセージをクエリパラメータに追加して再読み込み
        const errorParams = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: responseType,
            scope,
            state,
            error: 'Invalid username or password',
        })
        return c.redirect(`/login?${errorParams.toString()}`)
    }

    // ----------------------------------------------------------------
    // セッションIDを作成 (ユーザーを紐づけ)
    // ----------------------------------------------------------------
    const sessionId = nanoid()
    // セッションストアにユーザー名を保存 (今回は面倒なのでユーザー名をIDとして扱う)
    sessionStore.set(sessionId, username)

    // クッキーにセッションIDを保存
    setCookie(c, 'auth_session_id', sessionId, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: true,
    })

    // ----------------------------------------------------------------
    // /authorize にリダイレクト
    // ----------------------------------------------------------------
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope,
        state,
    })
    return c.redirect(`/authorize?${params.toString()}`)
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
function LoginCard({ c, children }: { c: Context; children: JSX.HTMLAttributes }) {
    const error = c.req.query('error')
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-sm rounded-2xl bg-gray-800 p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
                {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}
                <p className="mb-6 text-center text-sm text-gray-400">Please enter your credentials to log in</p>
                {children}
            </div>
        </div>
    )
}

function UserNameInput() {
    return (
        <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
            </label>
            <input
                type="text"
                id="username"
                name="username"
                value={USER_NAME}
                required={true}
                placeholder="user"
                autoComplete="username"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
        </div>
    )
}

function PasswordInput() {
    return (
        <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
            </label>
            <input
                type="password"
                id="password"
                name="password"
                value={USER_PASSWORD}
                required={true}
                placeholder="password"
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
        </div>
    )
}
