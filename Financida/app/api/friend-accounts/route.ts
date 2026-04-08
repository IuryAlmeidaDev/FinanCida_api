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
      {
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel criar a conta.",
      },
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
    const accounts = await handleFriendAccountDecision(user.id, input)

    return NextResponse.json({ accounts })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel decidir sobre a conta compartilhada.",
      },
      { status: 500 }
    )
  }
}
