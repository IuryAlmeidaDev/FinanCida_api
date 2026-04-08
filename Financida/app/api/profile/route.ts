import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  profileUpdateSchema,
  readUserProfile,
  updateUserProfile,
} from "@/lib/profile-store"

export const runtime = "nodejs"

async function getRequestUser(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  return getAuthUserFromToken(token)
}

export async function GET(request: Request) {
  const user = await getRequestUser(request)

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
  }

  return NextResponse.json({
    profile: await readUserProfile(user.id),
  })
}

export async function PUT(request: Request) {
  try {
    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const input = profileUpdateSchema.parse(await request.json())
    const profile = await updateUserProfile(user.id, input)

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Nao foi possivel atualizar o perfil." },
      { status: 500 }
    )
  }
}
