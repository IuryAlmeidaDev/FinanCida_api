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
    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const input = friendRequestInputSchema.parse(await request.json())
    await sendFriendRequest(user.id, input.handle)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
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
    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const input = friendRequestActionSchema.parse(await request.json())
    await acceptFriendRequest(user.id, input.friendshipId)

    const [friends, pendingRequests] = await Promise.all([
      listFriends(user.id),
      listPendingFriendRequests(user.id),
    ])

    return NextResponse.json({ friends, pendingRequests, currentHandle: user.handle })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Não foi possível aceitar o convite." },
      { status: 500 }
    )
  }
}
