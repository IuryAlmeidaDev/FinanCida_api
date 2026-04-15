import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  acceptFriendRequest,
  friendRequestActionSchema,
  friendRequestInputSchema,
  listFriends,
  listPendingFriendRequests,
  sendFriendRequest,
} from "@/lib/friends-store"
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

  const [friends, pendingRequests] = await Promise.all([
    listFriends(user.id),
    listPendingFriendRequests(user.id),
  ])

  return NextResponse.json({ friends, pendingRequests, currentHandle: user.handle })
}

export async function POST(request: Request) {
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

    const input = friendRequestInputSchema.parse(await readJsonBody(request))
    await sendFriendRequest(user.id, input.handle)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Não foi possível enviar o convite." },
      { status: 400 }
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

    const input = friendRequestActionSchema.parse(await readJsonBody(request))
    await acceptFriendRequest(user.id, input.friendshipId)

    const [friends, pendingRequests] = await Promise.all([
      listFriends(user.id),
      listPendingFriendRequests(user.id),
    ])

    return NextResponse.json({ friends, pendingRequests, currentHandle: user.handle })
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Não foi possível aceitar o convite." },
      { status: 500 }
    )
  }
}
