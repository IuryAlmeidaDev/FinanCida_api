import { describe, expect, it } from "vitest"

import {
  authCookieName,
  authRefreshCookieName,
  normalizeEmail,
  readAuthTokenFromCookieHeader,
  readRefreshTokenFromCookieHeader,
} from "@/lib/auth"

describe("auth helpers", () => {
  it("normaliza email", () => {
    expect(normalizeEmail("  USER@Example.com  ")).toBe("user@example.com")
  })

  it("le access token do cookie header", () => {
    const token = "access-token-123"
    const cookieHeader = `${authCookieName}=${token}; Path=/; HttpOnly`

    expect(readAuthTokenFromCookieHeader(cookieHeader)).toBe(token)
  })

  it("le refresh token do cookie header", () => {
    const token = "refresh-token-123"
    const cookieHeader = `${authRefreshCookieName}=${token}; Path=/; HttpOnly`

    expect(readRefreshTokenFromCookieHeader(cookieHeader)).toBe(token)
  })
})
