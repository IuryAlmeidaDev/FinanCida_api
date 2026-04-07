import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { listFinanceMovements, movementInputSchema } from "@/lib/finance-movements"
import {
  createFinanceMovement,
  readFinanceDataset,
} from "@/lib/finance-store"

export const runtime = "nodejs"

export async function GET() {
  const dataset = await readFinanceDataset()

  return NextResponse.json({
    movements: listFinanceMovements(dataset),
  })
}

export async function POST(request: Request) {
  try {
    const input = movementInputSchema.parse(await request.json())
    const dataset = await createFinanceMovement(input)

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
