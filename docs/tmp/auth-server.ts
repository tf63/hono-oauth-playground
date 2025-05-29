import { Hono } from 'hono'
import { nanoid } from 'nanoid'

const app = new Hono()

const authCodes = new Map<string, string>() // code -> client_id
const accessTokens = new Map<string, string>() // token -> client_id

// 認可エンドポイント: クライアントからのリダイレクト要求
app.get('/authorize', (c) => {
    const clientId = c.req.query('client_id')
    const redirectUri = c.req.query('redirect_uri')

    const code = nanoid()
    authCodes.set(code, clientId || '')

    return c.redirect(`${redirectUri}?code=${code}`)
})

// トークンエンドポイント: 認可コードをトークンに交換
app.post('/token', async (c) => {
    const body = await c.req.parseBody()
    const code = body.code
    const clientId = body.client_id

    if (typeof code !== 'string' || authCodes.get(code) !== clientId) {
        return c.json({ error: 'invalid_grant' }, 400)
    }

    authCodes.delete(code)

    const token = nanoid()
    accessTokens.set(token, clientId || '')

    return c.json({ access_token: token, token_type: 'Bearer' })
})

// アクセストークンの検証用
app.get('/introspect', (c) => {
    const token = c.req.query('token')
    if (accessTokens.has(token || '')) {
        return c.json({ active: true })
    }

    return c.json({ active: false })
})

export default app
