import { NextResponse } from "next/server"
import { z } from "zod"

import {
  applySessionCookies,
  normalizeEmail,
  signupWithSupabase,
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

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
})

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

    const input = signupSchema.parse(await readJsonBody(request))
    const email = normalizeEmail(input.email)

    const { user, session } = await signupWithSupabase({
      name: input.name,
      email,
      password: input.password,
    })
    const response = NextResponse.json(
      { user },
      { status: 201 }
    )

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
          { error: "Muitas tentativas de cadastro. Tente novamente em instantes." },
          { status: 429 }
        )
      }

      if (error.status === 400 && error.code === "email_address_invalid") {
        return NextResponse.json(
          { error: "Email invalido para cadastro." },
          { status: 400 }
        )
      }

      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already in use") ||
        error.code === "user_already_exists"
      ) {
        return NextResponse.json(
          { error: "Este email ja possui cadastro." },
          { status: 409 }
        )
      }
    }

    if (error instanceof Error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already in use")
      ) {
        return NextResponse.json(
          { error: "Este email ja possui cadastro." },
          { status: 409 }
        )
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados invalidos para o cadastro.", issues: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Nao foi possivel criar a conta." },
      { status: 500 }
    )
  }
}
