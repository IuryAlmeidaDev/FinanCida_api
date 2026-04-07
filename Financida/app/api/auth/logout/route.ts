import { NextResponse } from "next/server"

import { authCookieName } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url))

  response.cookies.set(authCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return response
}

export async function POST(request: Request) {
  return GET(request)
}