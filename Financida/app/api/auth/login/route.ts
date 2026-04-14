import { NextResponse } from "next/server"
import { z } from "zod"

import {
  normalizeEmail,
  setAuthCookie,
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

    setAuthCookie(response, token)

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados invalidos para o login.", issues: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Nao foi possivel autenticar." },
      { status: 500 }
    )
  }
}
