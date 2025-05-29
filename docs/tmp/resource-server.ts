import { Hono } from 'hono'

const app = new Hono()

// ファイルパスなどのリソースを返すAPI
app.get('/file', async (c) => {
    const auth = c.req.header('Authorization')
    const token = auth?.split(' ')[1]

    if (!token) {
        return c.json({ error: 'missing_token' }, 401)
    }

    // introspectでトークンを確認（本来はキャッシュやDBなどを使う）
    const res = await fetch(`http://localhost:3001/introspect?token=${token}`)
    const result = await res.json()

    if (!result.active) {
        return c.json({ error: 'invalid_token' }, 401)
    }

    // トークン有効ならファイルパスを返す
    return c.json({ path: '/public/favicon.ico' })
})

export default app
