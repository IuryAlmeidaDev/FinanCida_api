import { NextResponse } from "next/server"

import {
  applySessionCookies,
  clearAuthCookie,
  getAuthUserFromToken,
  readAuthTokenFromCookieHeader,
  readRefreshTokenFromCookieHeader,
  tryRefreshAuthSession,
} from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie")
  const token = readAuthTokenFromCookieHeader(cookieHeader)
  const refreshToken = readRefreshTokenFromCookieHeader(cookieHeader)
  const user = await getAuthUserFromToken(token)

  if (!user) {
    const refreshedSession = await tryRefreshAuthSession(refreshToken)

    if (refreshedSession) {
      const refreshedUser = await getAuthUserFromToken(
        refreshedSession.session.access_token
      )

      if (refreshedUser) {
        const refreshedResponse = NextResponse.json({ user: refreshedUser })
        applySessionCookies(refreshedResponse, refreshedSession.session)
        return refreshedResponse
      }
    }

    const response = NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    clearAuthCookie(response)
    return response
  }

  const response = NextResponse.json({ user })
  return response
}
