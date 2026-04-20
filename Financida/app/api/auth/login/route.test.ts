import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  normalizeEmail: vi.fn((value: string) => value.trim().toLowerCase()),
  loginWithSupabase: vi.fn(),
  applySessionCookies: vi.fn(),
}))

const authStoreMocks = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
}))

const bcryptMocks = vi.hoisted(() => ({
  compare: vi.fn(),
}))

const supabaseAuthMocks = vi.hoisted(() => {
  class SupabaseAuthError extends Error {
    status: number
    code?: string

    constructor(message: string, status: number, code?: string) {
      super(message)
      this.name = "SupabaseAuthError"
      this.status = status
      this.code = code
    }
  }

  return {
    SupabaseAuthError,
    createSupabaseUserWithPasswordIfMissing: vi.fn(),
  }
})

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/auth-store", () => authStoreMocks)
vi.mock("bcryptjs", () => ({
  default: bcryptMocks,
}))
vi.mock("@/lib/supabase-auth", () => supabaseAuthMocks)

import { POST } from "@/app/api/auth/login/route"
import { SupabaseAuthError } from "@/lib/supabase-auth"

describe("login API", () => {
  beforeEach(() => {
    authMocks.normalizeEmail.mockClear()
    authMocks.loginWithSupabase.mockReset()
    authMocks.applySessionCookies.mockReset()
    authStoreMocks.findUserByEmail.mockReset()
    bcryptMocks.compare.mockReset()
    supabaseAuthMocks.createSupabaseUserWithPasswordIfMissing.mockReset()
  })

  it("autentica usuario com Supabase", async () => {
    authMocks.loginWithSupabase.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@example.com",
        handle: "ana#1234",
      },
      session: {
        access_token: "access-token",
        refresh_token: "refresh-token",
      },
    })

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "ana@example.com",
          password: "senha-segura-123",
        }),
      })
    )

    const payload = (await response.json()) as { user: { email: string } }

    expect(response.status).toBe(200)
    expect(payload.user.email).toBe("ana@example.com")
    expect(authMocks.loginWithSupabase).toHaveBeenCalledTimes(1)
    expect(authMocks.applySessionCookies).toHaveBeenCalledTimes(1)
  })

  it("rejeita credenciais invalidas", async () => {
    authMocks.loginWithSupabase.mockRejectedValue(
      new SupabaseAuthError("Invalid login credentials", 400, "invalid_credentials")
    )
    authStoreMocks.findUserByEmail.mockResolvedValue(null)

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "ana@example.com",
          password: "senha-segura-123",
        }),
      })
    )

    expect(response.status).toBe(401)
  })

  it("migra usuario legado no primeiro login", async () => {
    authMocks.loginWithSupabase
      .mockRejectedValueOnce(
        new SupabaseAuthError("Invalid login credentials", 400, "invalid_credentials")
      )
      .mockResolvedValueOnce({
        user: {
          id: "user-1",
          name: "Ana",
          email: "ana@example.com",
          handle: "ana#1234",
        },
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
        },
      })
    authStoreMocks.findUserByEmail.mockResolvedValue({
      id: "legacy-1",
      name: "Ana",
      email: "ana@example.com",
      handle: "ana#1234",
      passwordHash: "legacy-hash",
    })
    bcryptMocks.compare.mockResolvedValue(true)

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "ana@example.com",
          password: "senha-segura-123",
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(authStoreMocks.findUserByEmail).toHaveBeenCalledTimes(1)
    expect(bcryptMocks.compare).toHaveBeenCalledTimes(1)
    expect(
      supabaseAuthMocks.createSupabaseUserWithPasswordIfMissing
    ).toHaveBeenCalledTimes(1)
    expect(authMocks.loginWithSupabase).toHaveBeenCalledTimes(2)
  })

  it("bloqueia login vindo de outra origem", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          origin: "https://evil.example",
        },
        body: JSON.stringify({
          email: "ana@example.com",
          password: "senha-segura-123",
        }),
      })
    )

    expect(response.status).toBe(403)
    expect(authMocks.loginWithSupabase).not.toHaveBeenCalled()
  })

  it("retorna erro 400 para JSON malformado", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: "{bad-json",
      })
    )

    expect(response.status).toBe(400)
  })
})
