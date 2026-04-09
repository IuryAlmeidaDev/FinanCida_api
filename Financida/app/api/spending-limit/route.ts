import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  readSpendingLimit,
  spendingLimitInputSchema,
  writeSpendingLimit,
} from "@/lib/spending-limit-store"

export const runtime = "nodejs"

async function getRequestUser(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  return getAuthUserFromToken(token)
}

export async function GET(request: Request) {
  const user = await getRequestUser(request)

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  return NextResponse.json({
    monthlyLimit: await readSpendingLimit(user.id),
  })
}

export async function PUT(request: Request) {
  try {
    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const input = spendingLimitInputSchema.parse(await request.json())
    const monthlyLimit = await writeSpendingLimit(user.id, input)

    return NextResponse.json({ monthlyLimit })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Não foi possível salvar o limite de gastos." },
      { status: 500 }
    )
  }
}
