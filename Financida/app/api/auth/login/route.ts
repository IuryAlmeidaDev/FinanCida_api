import { NextResponse } from "next/server"
import { z } from "zod"

import {
  applySessionCookies,
  loginWithSupabase,
  normalizeEmail,
} from "@/lib/auth"
import {
  jsonParseErrorResponse,
  readJsonBody,
  rejectLargeRequest,
  rejectCrossSiteRequest,
  rejectUnsupportedJsonContentType,
} from "@/lib/security"
import { SupabaseAuthError } from "@/lib/supabase-auth"

export const runtime = "nodejs"

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

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

    const input = loginSchema.parse(await readJsonBody(request))
    const email = normalizeEmail(input.email)
    const { user, session } = await loginWithSupabase({
      email,
      password: input.password,
    })
    const response = NextResponse.json({ user })
    applySessionCookies(response, session)
    return response
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
    }

    if (error instanceof SupabaseAuthError) {
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Muitas tentativas de login. Tente novamente em instantes." },
          { status: 429 }
        )
      }

      if (error.status === 400 && error.code === "email_address_invalid") {
        return NextResponse.json(
          { error: "Email invalido para login." },
          { status: 400 }
        )
      }

      if (
        error.message.toLowerCase().includes("invalid login") ||
        error.message.toLowerCase().includes("invalid_credentials")
      ) {
        return NextResponse.json(
          { error: "Email ou senha invalidos." },
          { status: 401 }
        )
      }
    }

    if (error instanceof Error) {
      if (
        error.message.toLowerCase().includes("invalid login") ||
        error.message.toLowerCase().includes("invalid_credentials")
      ) {
        return NextResponse.json(
          { error: "Email ou senha invalidos." },
          { status: 401 }
        )
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados invalidos para o login.", issues: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Nao foi possivel autenticar." },
      { status: 500 }
    )
  }
}
