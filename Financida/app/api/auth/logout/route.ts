import { NextResponse } from "next/server"

import { clearAuthCookie } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url))

  clearAuthCookie(response)

  return response
}

export async function POST(request: Request) {
  return GET(request)
}
