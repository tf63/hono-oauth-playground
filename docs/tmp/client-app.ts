import { Hono } from 'hono'

const app = new Hono()

const clientId = 'my-client-id'
const redirectUri = 'http://localhost:3002/callback'

// ログイン開始
app.get('/login', (c) => {
    const authUrl = new URL('http://localhost:3001/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)

    return c.redirect(authUrl.toString())
})

// 認可コードのコールバック
app.get('/callback', async (c) => {
    const code = c.req.query('code')

    const res = await fetch('http://localhost:3001/token', {
        method: 'POST',
        body: new URLSearchParams({
            code: code || '',
            client_id: clientId,
        }),
    })

    const data = await res.json()
    const token = data.access_token

    return c.redirect(`/fetch-resource?token=${token}`)
})

// リソース取得
app.get('/fetch-resource', async (c) => {
    const token = c.req.query('token')

    const res = await fetch('http://localhost:3003/file', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const data = await res.json()
    return c.json({ filePath: data.path })
})

export default app
