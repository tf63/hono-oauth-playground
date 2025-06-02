import { createRoute } from 'honox/factory'

export default createRoute((c) => {
    const clientId = c.req.query('client_id') || ''
    const redirectUri = c.req.query('redirect_uri') || ''
    const responseType = c.req.query('response_type') || ''
    const scope = c.req.query('scope') || ''
    const state = c.req.query('state') || ''
    const error = c.req.query('error')
    return c.render(
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
                {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
                <p className="mb-6 text-center text-sm text-slate-500">Please enter your credentials to log in</p>
                <form method="post">
                    <input type="hidden" name="client_id" value={clientId} />
                    <input type="hidden" name="redirect_uri" value={redirectUri} />
                    <input type="hidden" name="response_type" value={responseType} />
                    <input type="hidden" name="scope" value={scope} />
                    <input type="hidden" name="state" value={state} />
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required={true}
                            placeholder="user"
                            autocomplete="username"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required={true}
                            placeholder="password"
                            autocomplete="current-password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-400 py-2 text-white transition hover:bg-indigo-500"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    )
})

export const POST = createRoute(async (c) => {
    const body = await c.req.parseBody<{
        username: string
        password: string
        client_id: string
        redirect_uri: string
        response_type: string
        scope: string
        state: string
    }>()
    const { username, password, client_id, redirect_uri, response_type, scope, state } = body

    // 簡易的な認証処理（例: ユーザー名とパスワードを固定値でチェック）
    if (username === 'user' && password === 'password') {
        // 認証成功時に /authorize にリダイレクト
        const params = new URLSearchParams({
            client_id,
            redirect_uri,
            response_type,
            scope,
            state,
        })
        return c.redirect(`/authorize?${params.toString()}`)
    }

    // 認証失敗時にエラーメッセージをクエリパラメータに追加してリダイレクト
    const errorParams = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type,
        scope,
        state,
        error: 'Invalid username or password',
    })
    return c.redirect(`/login?${errorParams.toString()}`)
})
