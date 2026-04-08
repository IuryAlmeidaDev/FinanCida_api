import { NextResponse } from "next/server"
import { z, ZodError } from "zod"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  listNotifications,
  markNotificationAsRead,
} from "@/lib/notifications-store"

export const runtime = "nodejs"

const notificationReadSchema = z.object({
  notificationId: z.string().min(1),
})

async function getRequestUser(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  return getAuthUserFromToken(token)
}

export async function GET(request: Request) {
  const user = await getRequestUser(request)

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
  }

  return NextResponse.json({
    notifications: await listNotifications(user.id),
  })
}

export async function PATCH(request: Request) {
  try {
    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const input = notificationReadSchema.parse(await request.json())
    await markNotificationAsRead(user.id, input.notificationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados invalidos." }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Nao foi possivel atualizar a notificacao." },
      { status: 500 }
    )
  }
}
