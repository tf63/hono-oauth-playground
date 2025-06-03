import { createRoute } from 'honox/factory'
import { nanoid } from 'nanoid'

// 簡易的なデータストア（認可コードとアクセストークンを管理）
const authorizationCodes = new Map<string, { clientId: string; redirectUri: string }>()
const accessTokens = new Map<string, { clientId: string; scope: string }>()

export const POST = createRoute(async (c) => {
    const body = await c.req.parseBody<{
        grant_type: string
        code: string
        redirect_uri: string
        client_id: string
        client_secret: string
    }>()

    const { grant_type, code, redirect_uri, client_id, client_secret } = body

    // クライアント認証を検証（簡易的な例）
    if (client_id !== 'your-client-id' || client_secret !== 'your-client-secret') {
        return c.text('Invalid client credentials', 401)
    }

    // grant_type が authorization_code であることを確認
    if (grant_type !== 'authorization_code') {
        return c.text('Unsupported grant type', 400)
    }

    // 認可コードを検証
    const storedCode = authorizationCodes.get(code)
    if (!storedCode) {
        return c.text('Invalid or expired authorization code', 400)
    }

    // redirect_uri が一致するか確認
    if (storedCode.redirectUri !== redirect_uri) {
        return c.text('Redirect URI mismatch', 400)
    }

    // アクセストークンを生成
    const accessToken = nanoid()
    accessTokens.set(accessToken, { clientId: client_id, scope: 'hoge' }) // スコープは固定値

    // 認可コードを削除（再利用を防ぐ）
    authorizationCodes.delete(code)

    // アクセストークンを返却
    return c.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600, // 有効期限（秒）
    })
})

// 認可コードを保存する関数（認可コード発行時に使用）
export function saveAuthorizationCode(code: string, clientId: string, redirectUri: string) {
    authorizationCodes.set(code, { clientId, redirectUri })
}

export default POST
