import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  authCookieName,
  getAuthUserFromToken,
  hashPassword,
  normalizeEmail,
  readAuthTokenFromCookieHeader,
  signAuthToken,
  verifyAuthToken,
  verifyPassword,
} from "@/lib/auth"

describe("auth helpers", () => {
  beforeEach(() => {
    process.env.AUTH_JWT_SECRET = "test-secret"
  })

  afterEach(() => {
    delete process.env.AUTH_JWT_SECRET
  })

  it("normaliza email", () => {
    expect(normalizeEmail("  USER@Example.com  ")).toBe("user@example.com")
  })

  it("hashes and verifies passwords", async () => {
    const passwordHash = await hashPassword("senha-segura-123")

    expect(await verifyPassword("senha-segura-123", passwordHash)).toBe(true)
    expect(await verifyPassword("outra-senha", passwordHash)).toBe(false)
  })

  it("assina e valida token JWT", async () => {
    const token = await signAuthToken({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
    })

    await expect(verifyAuthToken(token)).resolves.toMatchObject({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
    })
    await expect(getAuthUserFromToken(token)).resolves.toMatchObject({
      id: "user-1",
    })
  })

  it("lê token do cookie header", () => {
    const token = "abc123"

    expect(
      readAuthTokenFromCookieHeader(`${authCookieName}=${token}; Path=/; HttpOnly`)
    ).toBe(token)
  })
})