import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import { normalizeFinanceDataset } from "@/lib/finance"
import { readFinanceDataset, writeFinanceDataset } from "@/lib/finance-store"
import {
  jsonParseErrorResponse,
  readJsonBody,
  rejectCrossSiteRequest,
  rejectLargeRequest,
  rejectUnsupportedJsonContentType,
} from "@/lib/security"

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
  const crossSiteResponse = rejectCrossSiteRequest(request)

  if (crossSiteResponse) {
    return crossSiteResponse
  }

  const largeRequestResponse = rejectLargeRequest(request, 512 * 1024)

  if (largeRequestResponse) {
    return largeRequestResponse
  }

  const contentTypeResponse = rejectUnsupportedJsonContentType(request)

  if (contentTypeResponse) {
    return contentTypeResponse
  }

  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  const user = await getAuthUserFromToken(token)

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
  }

  try {
    const input = normalizeFinanceDataset(await readJsonBody(request))
    const dataset = await writeFinanceDataset(user.id, input)

    return NextResponse.json({ dataset })
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados invalidos para o financeiro.", issues: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Nao foi possivel salvar as categorias." },
      { status: 500 }
    )
  }
}
