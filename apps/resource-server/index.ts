import { Hono } from 'hono'

const app = new Hono()

const AUTHORIZATION_SERVER = 'http://localhost:3001' // 認可サーバーのURL

app.get('/resource', async (c) => {
    // ----------------------------------------------------------------
    // Authorizationヘッダーからアクセストークンを取得
    // ----------------------------------------------------------------
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.text('Missing or invalid Authorization header', 401)
    }
    const token = authHeader.split(' ')[1]

    // ----------------------------------------------------------------
    // 認可サーバーにトークンの有効性を問い合わせる
    // ----------------------------------------------------------------
    const introspectionResponse = await fetch(`${AUTHORIZATION_SERVER}/api/introspect`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            token,
        }).toString(),
    })

    if (!introspectionResponse.ok) {
        return c.text('Failed to introspect token', 401)
    }

    const introspectionResult = await introspectionResponse.json()

    // トークンが無効または期限切れの場合
    if (!introspectionResult.active) {
        return c.text('Invalid or expired access token', 401)
    }

    // 保護されたリソースを返却
    return c.json({
        message: 'Access to protected resource granted',
        scope: introspectionResult.scope, // トークンに紐付けられたスコープ
    })
})

export default app
