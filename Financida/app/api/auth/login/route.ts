import { NextResponse } from "next/server"
import { z } from "zod"

import {
  normalizeEmail,
  setAuthCookie,
  signAuthToken,
  toPublicAuthUser,
  verifyPassword,
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
    const rateLimit = checkRateLimit(
      `login:${getClientIp(request)}:${email}`,
      {
        limit: 8,
        windowMs: 15 * 60 * 1000,
      }
    )

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds)
    }

    const user = await findUserByEmail(email)

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Email ou senha invalidos." },
        { status: 401 }
      )
    }

    const token = await signAuthToken(toPublicAuthUser(user))
    const response = NextResponse.json({ user: toPublicAuthUser(user) })

    setAuthCookie(response, token)

    return response
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
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
