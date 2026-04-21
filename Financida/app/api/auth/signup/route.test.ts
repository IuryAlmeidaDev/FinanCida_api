import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  normalizeEmail: vi.fn((value: string) => value.trim().toLowerCase()),
  signupWithSupabase: vi.fn(),
  applySessionCookies: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)

import { POST } from "@/app/api/auth/signup/route"

describe("signup API", () => {
  beforeEach(() => {
    authMocks.normalizeEmail.mockClear()
    authMocks.signupWithSupabase.mockReset()
    authMocks.applySessionCookies.mockReset()
  })

  it("cria usuario com Supabase", async () => {
    authMocks.signupWithSupabase.mockResolvedValue({
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
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Ana",
          email: "ana@example.com",
          password: "senha-segura-123",
        }),
      })
    )

    const payload = (await response.json()) as {
      user: { email: string; handle: string }
    }

    expect(response.status).toBe(201)
    expect(payload.user.email).toBe("ana@example.com")
    expect(payload.user.handle).toBe("ana#1234")
    expect(authMocks.signupWithSupabase).toHaveBeenCalledTimes(1)
    expect(authMocks.applySessionCookies).toHaveBeenCalledTimes(1)
  })

  it("rejeita email duplicado", async () => {
    authMocks.signupWithSupabase.mockRejectedValue(new Error("User already registered"))

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Ana",
          email: "ana@example.com",
          password: "senha-segura-123",
        }),
      })
    )

    expect(response.status).toBe(409)
  })

  it("bloqueia cadastro vindo de outra origem", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: {
          origin: "https://evil.example",
        },
        body: JSON.stringify({
          name: "Ana",
          email: "ana@example.com",
          password: "senha-segura-123",
        }),
      })
    )

    expect(response.status).toBe(403)
    expect(authMocks.signupWithSupabase).not.toHaveBeenCalled()
  })

  it("nao aplica rate limit local no cadastro", async () => {
    const mutableEnv = process.env as Record<string, string | undefined>
    const previousNodeEnv = mutableEnv.NODE_ENV
    mutableEnv.NODE_ENV = "production"

    authMocks.signupWithSupabase.mockRejectedValue(new Error("User already registered"))

    try {
      let lastStatus = 0

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const response = await POST(
          new Request("http://localhost/api/auth/signup", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: "Ana",
              email: "ana@example.com",
              password: "senha-segura-123",
            }),
          })
        )

        lastStatus = response.status
      }

      expect(lastStatus).toBe(409)
    } finally {
      mutableEnv.NODE_ENV = previousNodeEnv
    }
  })
})
