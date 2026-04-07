import { NextResponse } from "next/server"

import { readFinanceDataset } from "@/lib/finance-store"

export const runtime = "nodejs"

export async function GET() {
  const dataset = await readFinanceDataset()

  return NextResponse.json({ dataset })
}
