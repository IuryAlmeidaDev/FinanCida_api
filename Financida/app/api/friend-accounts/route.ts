import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  acceptFriendAccount,
  createFriendAccount,
  friendAccountAcceptSchema,
  friendAccountInputSchema,
  listFriendAccounts,
} from "@/lib/friend-accounts-store"

export const runtime = "nodejs"

async function getRequestUser(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  return getAuthUserFromToken(token)
}

export async function GET(request: Request) {
  const user = await getRequestUser(request)

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
  }

  return NextResponse.json({ accounts: await listFriendAccounts(user.id) })
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const input = friendAccountInputSchema.parse(await request.json())
    const accounts = await createFriendAccount(user.id, input)

    return NextResponse.json({ accounts }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Nao foi possivel criar a conta." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const input = friendAccountAcceptSchema.parse(await request.json())
    const accounts = await acceptFriendAccount(user.id, input.accountId)

    return NextResponse.json({ accounts })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Nao foi possivel aceitar a conta compartilhada." },
      { status: 500 }
    )
  }
}
