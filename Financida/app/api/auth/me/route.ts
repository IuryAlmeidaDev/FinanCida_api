import { NextResponse } from "next/server"

import {
  clearAuthCookie,
  getAuthUserFromToken,
  readAuthTokenFromCookieHeader,
  setAuthCookie,
  signAuthToken,
} from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  const user = await getAuthUserFromToken(token)

  if (!user) {
    const response = NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    clearAuthCookie(response)
    return response
  }

  const refreshedToken = await signAuthToken(user)
  const response = NextResponse.json({ user })
  setAuthCookie(response, refreshedToken)
  return response
}
