import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  createFriendAccount,
  friendAccountAcceptSchema,
  friendAccountInputSchema,
  handleFriendAccountDecision,
  listFriendAccounts,
} from "@/lib/friend-accounts-store"
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

  return NextResponse.json({ accounts: await listFriendAccounts(user.id) })
}

export async function POST(request: Request) {
  try {
    const crossSiteResponse = rejectCrossSiteRequest(request)

    if (crossSiteResponse) {
      return crossSiteResponse
    }

    const largeRequestResponse = rejectLargeRequest(request, 32 * 1024)

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

    const input = friendAccountInputSchema.parse(await readJsonBody(request))
    const accounts = await createFriendAccount(user.id, input)

    return NextResponse.json({ accounts }, { status: 201 })
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível criar a conta.",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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

    const input = friendAccountAcceptSchema.parse(await readJsonBody(request))
    const accounts = await handleFriendAccountDecision(user.id, input)

    return NextResponse.json({ accounts })
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível decidir sobre a conta compartilhada.",
      },
      { status: 500 }
    )
  }
}
