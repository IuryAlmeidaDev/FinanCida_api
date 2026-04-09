import { NextResponse } from "next/server"
import { z } from "zod"

import {
  authCookieName,
  normalizeEmail,
  signAuthToken,
  toPublicAuthUser,
  verifyPassword,
} from "@/lib/auth"
import { findUserByEmail } from "@/lib/auth-store"

export const runtime = "nodejs"

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json())
    const user = await findUserByEmail(normalizeEmail(input.email))

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Email ou senha invalidos." },
        { status: 401 }
      )
    }

    const token = await signAuthToken(toPublicAuthUser(user))
    const response = NextResponse.json({ user: toPublicAuthUser(user) })

    response.cookies.set(authCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados invalidos para o login.", issues: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Não foi possível autenticar." },
      { status: 500 }
    )
  }
}
