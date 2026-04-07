import { NextResponse } from "next/server"

import { getFinancialSummary } from "@/lib/finance-store"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const month = Number(url.searchParams.get("month"))
  const year = Number(url.searchParams.get("year"))

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Informe um mes valido entre 1 e 12." },
      { status: 400 }
    )
  }

  if (!Number.isInteger(year) || year < 2000) {
    return NextResponse.json(
      { error: "Informe um ano valido." },
      { status: 400 }
    )
  }

  const summary = await getFinancialSummary({ month, year })

  return NextResponse.json({ summary })
}
