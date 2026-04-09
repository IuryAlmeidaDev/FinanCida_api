import { NextResponse } from "next/server"
import { z } from "zod"

import {
  authCookieName,
  hashPassword,
  normalizeEmail,
  signAuthToken,
  toPublicAuthUser,
} from "@/lib/auth"
import { createUser, findUserByEmail } from "@/lib/auth-store"

export const runtime = "nodejs"

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
})

export async function POST(request: Request) {
  try {
    const input = signupSchema.parse(await request.json())
    const email = normalizeEmail(input.email)
    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ja possui cadastro." },
        { status: 409 }
      )
    }

    const user = await createUser({
      name: input.name,
      email,
      passwordHash: await hashPassword(input.password),
    })
    const token = await signAuthToken(toPublicAuthUser(user))
    const response = NextResponse.json({ user: toPublicAuthUser(user) }, { status: 201 })

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
        { error: "Dados invalidos para o cadastro.", issues: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Não foi possível criar a conta." },
      { status: 500 }
    )
  }
}
