import { NextResponse } from "next/server"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  rejectCrossSiteRequest,
  rejectLargeRequest,
  unsupportedMediaTypeResponse,
} from "@/lib/security"
import { uploadProfileAvatar } from "@/lib/supabase-storage"

export const runtime = "nodejs"

async function getRequestUser(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  return getAuthUserFromToken(token)
}

export async function POST(request: Request) {
  try {
    const crossSiteResponse = rejectCrossSiteRequest(request)

    if (crossSiteResponse) {
      return crossSiteResponse
    }

    const largeRequestResponse = rejectLargeRequest(request, 3 * 1024 * 1024)

    if (largeRequestResponse) {
      return largeRequestResponse
    }

    const contentType = request.headers.get("content-type")

    if (!contentType?.toLowerCase().includes("multipart/form-data")) {
      return unsupportedMediaTypeResponse()
    }

    const user = await getRequestUser(request)

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo invalido." }, { status: 400 })
    }

    const avatarUrl = await uploadProfileAvatar(user.id, file)

    return NextResponse.json({ avatarUrl }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a imagem.",
      },
      { status: 500 }
    )
  }
}
