import { createRoute } from 'honox/factory'
import { nanoid } from 'nanoid'

import { accessTokenInfoStore, authorizationStore } from '../../lib/db'

export const POST = createRoute(async (c) => {
    const body = await c.req.parseBody<{
        grant_type: string
        code: string
        redirect_uri: string
        client_id: string
        client_secret: string
    }>()

    const { grant_type, code, redirect_uri, client_id, client_secret } = body

    // ----------------------------------------------------------------
    // クライアントIDとクライアントシークレットの検証
    // ----------------------------------------------------------------
    if (client_id !== 'your-client-id' || client_secret !== 'your-client-secret') {
        return c.text('Invalid client credentials', 401)
    }

    // ----------------------------------------------------------------
    // 認可情報の検証
    // ----------------------------------------------------------------
    // grant_type が authorization_code であることを確認
    if (grant_type !== 'authorization_code') {
        return c.text('Unsupported grant type', 400)
    }

    // 認可コードから認可情報を取得
    const storedCode = authorizationStore.get(code)
    if (!storedCode) {
        return c.text('Invalid or expired authorization code', 400)
    }

    // クライアントIDとリダイレクトURIの検証
    if (client_id !== storedCode.clientId || redirect_uri !== storedCode.redirectUri) {
        return c.text('Invalid request', 400)
    }

    // 認可コードを削除（再利用を防ぐ）
    authorizationStore.delete(code)

    // ----------------------------------------------------------------
    // アクセストークンの生成と保存
    // ----------------------------------------------------------------
    const accessToken = nanoid()
    accessTokenInfoStore.set(accessToken, { clientId: client_id, scope: storedCode.scope })

    // アクセストークンを返却
    return c.json({
        access_token: accessToken,
    })
})
