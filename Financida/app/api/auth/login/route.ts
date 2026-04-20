import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

import {
  applySessionCookies,
  loginWithSupabase,
  normalizeEmail,
} from "@/lib/auth"
import { findUserByEmail } from "@/lib/auth-store"
import {
  checkRateLimit,
  getClientIp,
  jsonParseErrorResponse,
  rateLimitResponse,
  readJsonBody,
  rejectLargeRequest,
  rejectCrossSiteRequest,
  rejectUnsupportedJsonContentType,
} from "@/lib/security"
import {
  createSupabaseUserWithPasswordIfMissing,
  SupabaseAuthError,
} from "@/lib/supabase-auth"

export const runtime = "nodejs"

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})
const legacyAuthFallbackEnabled =
  process.env.LEGACY_AUTH_FALLBACK?.toLowerCase() !== "false"

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
    const rateLimit = checkRateLimit(
      `login:${getClientIp(request)}:${email}`,
      {
        limit: process.env.NODE_ENV === "production" ? 8 : 300,
        windowMs: 15 * 60 * 1000,
      }
    )

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds)
    }

    try {
      const { user, session } = await loginWithSupabase({
        email,
        password: input.password,
      })
      const response = NextResponse.json({ user })
      applySessionCookies(response, session)
      return response
    } catch (error) {
      if (
        legacyAuthFallbackEnabled &&
        error instanceof SupabaseAuthError &&
        (error.message.toLowerCase().includes("invalid login") ||
          error.message.toLowerCase().includes("invalid_credentials"))
      ) {
        const legacyUser = await findUserByEmail(email)

        if (
          legacyUser &&
          legacyUser.passwordHash &&
          legacyUser.passwordHash !== "supabase-auth"
        ) {
          const validLegacyPassword = await bcrypt.compare(
            input.password,
            legacyUser.passwordHash
          )

          if (validLegacyPassword) {
            await createSupabaseUserWithPasswordIfMissing({
              email,
              password: input.password,
              name: legacyUser.name,
            })

            const migrated = await loginWithSupabase({
              email,
              password: input.password,
            })
            const response = NextResponse.json({ user: migrated.user })
            applySessionCookies(response, migrated.session)
            return response
          }
        }
      }

      throw error
    }
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
