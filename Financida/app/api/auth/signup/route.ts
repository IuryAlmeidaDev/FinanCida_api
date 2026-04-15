import { NextResponse } from "next/server"
import { z } from "zod"

import {
  hashPassword,
  normalizeEmail,
  setAuthCookie,
  signAuthToken,
  toPublicAuthUser,
} from "@/lib/auth"
import { createUser, findUserByEmail } from "@/lib/auth-store"
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
    const rateLimit = checkRateLimit(`signup:${getClientIp(request)}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    })

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.retryAfterSeconds)
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ja possui cadastro." },
        { status: 409 }
      )
    }

    const user = await createUser({
      name: input.name,
      email,
      passwordHash: await hashPassword(input.password),
    })
    const token = await signAuthToken(toPublicAuthUser(user))
    const response = NextResponse.json(
      { user: toPublicAuthUser(user) },
      { status: 201 }
    )

    setAuthCookie(response, token)

    return response
  } catch (error) {
    const jsonErrorResponse = jsonParseErrorResponse(error)

    if (jsonErrorResponse) {
      return jsonErrorResponse
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
