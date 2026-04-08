import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import { listFinanceMovements, movementInputSchema } from "@/lib/finance-movements"
import {
  createFinanceMovement,
  readFinanceDataset,
} from "@/lib/finance-store"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  const user = await getAuthUserFromToken(token)

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
  }

  const dataset = await readFinanceDataset(user.id)

  return NextResponse.json({
    movements: listFinanceMovements(dataset),
  })
}

export async function POST(request: Request) {
  try {
    const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
    const user = await getAuthUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const input = movementInputSchema.parse(await request.json())
    const dataset = await createFinanceMovement(user.id, input)

    return NextResponse.json(
      {
        dataset,
        movements: listFinanceMovements(dataset),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Dados invalidos para a movimentacao.",
          issues: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Nao foi possivel salvar a movimentacao." },
      { status: 500 }
    )
  }
}
