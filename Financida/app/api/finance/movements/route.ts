import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  listFinanceMovements,
  movementDeleteSchema,
  movementInputSchema,
  movementUpdateSchema,
} from "@/lib/finance-movements"
import {
  createFinanceMovement,
  deleteFinanceMovement,
  readFinanceDataset,
  updateFinanceMovement,
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

export async function DELETE(request: Request) {
  try {
    const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
    const user = await getAuthUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const input = movementDeleteSchema.parse(await request.json())
    const dataset = await deleteFinanceMovement(user.id, input)

    return NextResponse.json({
      dataset,
      movements: listFinanceMovements(dataset),
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Dados invalidos para remover a movimentacao.",
          issues: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Nao foi possivel remover a movimentacao." },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
    const user = await getAuthUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const input = movementUpdateSchema.parse(await request.json())
    const dataset = await updateFinanceMovement(user.id, input)

    return NextResponse.json({
      dataset,
      movements: listFinanceMovements(dataset),
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Dados invalidos para atualizar a movimentacao.",
          issues: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Nao foi possivel atualizar a movimentacao." },
      { status: 500 }
    )
  }
}
