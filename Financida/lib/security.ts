import { NextResponse } from "next/server"

const rateLimitBuckets = new Map<
  string,
  {
    count: number
    resetAt: number
  }
>()

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterSeconds: number }

export class BadJsonRequestError extends Error {
  constructor() {
    super("JSON invalido.")
    this.name = "BadJsonRequestError"
  }
}

export function badRequestResponse(message = "Requisicao invalida.") {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function payloadTooLargeResponse() {
  return NextResponse.json(
    { error: "Payload muito grande." },
    { status: 413 }
  )
}

export function unsupportedMediaTypeResponse() {
  return NextResponse.json(
    { error: "Content-Type nao suportado." },
    { status: 415 }
  )
}

export function rejectLargeRequest(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length")

  if (!contentLength) {
    return null
  }

  const parsedLength = Number(contentLength)

  if (!Number.isFinite(parsedLength) || parsedLength < 0) {
    return badRequestResponse("Content-Length invalido.")
  }

  if (parsedLength > maxBytes) {
    return payloadTooLargeResponse()
  }

  return null
}

export function rejectUnsupportedJsonContentType(request: Request) {
  const contentType = request.headers.get("content-type")

  if (!contentType || contentType.toLowerCase().includes("application/json")) {
    return null
  }

  return unsupportedMediaTypeResponse()
}

export async function readJsonBody(request: Request) {
  try {
    return await request.json()
  } catch {
    throw new BadJsonRequestError()
  }
}

export function jsonParseErrorResponse(error: unknown) {
  if (error instanceof BadJsonRequestError) {
    return badRequestResponse(error.message)
  }

  return null
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")

  if (!origin) {
    return true
  }

  const requestUrl = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const host = forwardedHost ?? request.headers.get("host") ?? requestUrl.host
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const protocol = forwardedProto ? `${forwardedProto}:` : requestUrl.protocol
  const expectedOrigin = `${protocol}//${host}`

  return origin === expectedOrigin
}

export function rejectCrossSiteRequest(request: Request) {
  if (isSameOriginRequest(request)) {
    return null
  }

  return NextResponse.json(
    { error: "Origem da requisicao nao autorizada." },
    { status: 403 }
  )
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  )
}

export function checkRateLimit(
  key: string,
  options: {
    limit: number
    windowMs: number
  }
): RateLimitResult {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    })

    return { limited: false }
  }

  if (bucket.count >= options.limit) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  bucket.count += 1
  return { limited: false }
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Muitas tentativas. Tente novamente em instantes." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  )
}
