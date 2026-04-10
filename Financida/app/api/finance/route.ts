import { NextResponse } from "next/server"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import { normalizeFinanceDataset } from "@/lib/finance"
import { readFinanceDataset, writeFinanceDataset } from "@/lib/finance-store"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  const user = await getAuthUserFromToken(token)

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const dataset = await readFinanceDataset(user.id)

  return NextResponse.json({ dataset })
}

export async function PUT(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  const user = await getAuthUserFromToken(token)

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
  }

  try {
    const input = normalizeFinanceDataset(await request.json())
    const dataset = await writeFinanceDataset(user.id, input)

    return NextResponse.json({ dataset })
  } catch (error) {
    return NextResponse.json(
      { error: "Nao foi possivel salvar as categorias." },
      { status: 500 }
    )
  }
}
