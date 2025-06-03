export type AuthorizationInfo = {
    clientId: string
    redirectUri: string
    scope: string
    expiredAt: string
    username: string
}

export const sessionStore = new Map<string, string>()
export const authorizationStore = new Map<string, AuthorizationInfo>()
export const accessTokenInfoStore = new Map<string, { clientId: string; scope: string }>()
