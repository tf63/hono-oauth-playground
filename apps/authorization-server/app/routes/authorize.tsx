import { createRoute } from 'honox/factory'

export default createRoute((c) => {
    const clientId = c.req.query('client_id') || ''
    const redirectUri = c.req.query('redirect_uri') || ''
    const responseType = c.req.query('response_type') || ''
    const scope = c.req.query('scope') || ''
    const state = c.req.query('state') || ''

    return c.render(
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold">Authorize Access</h1>
                <p className="mb-4 text-center text-sm text-slate-500">
                    The application <strong>{clientId}</strong> is requesting access to your resources.
                </p>
                <p className="mb-6 text-center text-sm text-slate-500">
                    Requested permissions: <strong>{scope}</strong>
                </p>
                <form method="post">
                    <input type="hidden" name="client_id" value={clientId} />
                    <input type="hidden" name="redirect_uri" value={redirectUri} />
                    <input type="hidden" name="response_type" value={responseType} />
                    <input type="hidden" name="scope" value={scope} />
                    <input type="hidden" name="state" value={state} />
                    <button
                        type="submit"
                        name="action"
                        value="approve"
                        className="w-full rounded-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
                    >
                        Approve
                    </button>
                </form>
            </div>
        </div>
    )
})

export const POST = createRoute(async (c) => {
    const body = await c.req.parseBody<{
        client_id: string
        redirect_uri: string
        response_type: string
        scope: string
        state: string
        action: 'approve'
    }>()
    const { redirect_uri, state, action } = body

    if (action === 'approve') {
        // 認可コードを生成（簡易的な例）
        const code = 'auth_code_example'

        const params = new URLSearchParams({
            code,
            state,
        })
        // リダイレクト先に認可コードを付与してリダイレクト
        return c.redirect(`${redirect_uri}?${params.toString()}`)
    }

    // デフォルトでエラーを返す（このケースは発生しない想定）
    return c.redirect(`${redirect_uri}?error=unexpected_error`)
})
