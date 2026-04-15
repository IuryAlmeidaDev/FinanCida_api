import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  readSpendingLimit,
  spendingLimitInputSchema,
  writeSpendingLimit,
} from "@/lib/spending-limit-store"
import {
  jsonParseErrorResponse,
  readJsonBody,
  rejectCrossSiteRequest,
  rejectLargeRequest,
  rejectUnsupportedJsonContentType,
} from "@/lib/security"

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
    const crossSiteResponse = rejectCrossSiteRequest(request)

    if (crossSiteResponse) {
      return crossSiteResponse
    }

    const largeRequestResponse = rejectLargeRequest(request, 16 * 1024)

    if (largeRequestResponse) {
      return largeRequestResponse
    }

    const contentTypeResponse = rejectUnsupportedJsonContentType(request)

    if (contentTypeResponse) {
      return contentTypeResponse
    }

    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const input = spendingLimitInputSchema.parse(await readJsonBody(request))
    const monthlyLimit = await writeSpendingLimit(user.id, input)

    return NextResponse.json({ monthlyLimit })
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Não foi possível salvar o limite de gastos." },
      { status: 500 }
    )
  }
}
