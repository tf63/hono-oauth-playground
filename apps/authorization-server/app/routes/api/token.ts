import { createRoute } from 'honox/factory'
import { nanoid } from 'nanoid'

import { accessTokenInfoStore, authorizationStore } from '../../lib/db'

const CLINET_ID = 'your-client-id' // クライアントID
const CLIENT_SECRET = 'your-client-secret' // クライアントシークレット

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
    if (client_id !== CLINET_ID || client_secret !== CLIENT_SECRET) {
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
    const authorizationInfo = authorizationStore.get(code)
    if (!authorizationInfo) {
        return c.text('Invalid authorization code', 400)
    }

    // 認可コードの有効期限の検証
    if (Date.now() > Number(authorizationInfo.expiredAt)) {
        return c.text('Authorization code expired', 400)
    }

    // クライアントIDとリダイレクトURIの検証
    if (client_id !== authorizationInfo.clientId || redirect_uri !== authorizationInfo.redirectUri) {
        return c.text('Invalid request', 400)
    }

    // 認可コードを削除 （再利用を防ぐ）
    authorizationStore.delete(code)

    // ----------------------------------------------------------------
    // アクセストークンの生成と保存
    // ----------------------------------------------------------------
    const accessToken = nanoid()
    accessTokenInfoStore.set(accessToken, { clientId: client_id, scope: authorizationInfo.scope })

    // アクセストークンを返却
    return c.json({
        access_token: accessToken,
    })
})
