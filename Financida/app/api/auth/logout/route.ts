import { NextResponse } from "next/server"

import {
  clearAuthCookie,
  logoutFromSupabase,
  readAuthTokenFromCookieHeader,
} from "@/lib/auth"
import { rejectCrossSiteRequest } from "@/lib/security"

export const runtime = "nodejs"

export async function GET(request: Request) {
  void request
  return NextResponse.json(
    { error: "Metodo nao permitido. Use POST para encerrar sessao." },
    { status: 405 }
  )
}

export async function POST(request: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(request)

  if (crossSiteResponse) {
    return crossSiteResponse
  }

  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  await logoutFromSupabase(token)

  const response = NextResponse.redirect(new URL("/", request.url))
  clearAuthCookie(response)
  return response
}
