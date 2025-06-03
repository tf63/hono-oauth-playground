import { createRoute } from 'honox/factory'

import { accessTokenInfoStore } from '../../lib/db'

export const POST = createRoute(async (c) => {
    const body = await c.req.parseBody<{ token: string }>()
    const token = body.token
    if (!token) {
        return c.json({ active: false }, 400)
    }

    // トークンを検証
    const tokenData = accessTokenInfoStore.get(token)
    if (!tokenData) {
        return c.json({ active: false })
    }

    // トークンが有効である場合のレスポンス
    return c.json({
        active: true,
        scope: tokenData.scope, // スコープ
    })
})
