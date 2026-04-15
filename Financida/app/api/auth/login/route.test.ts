import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { hashPassword } from "@/lib/auth"

const authStoreMocks = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
}))

vi.mock("@/lib/auth-store", () => authStoreMocks)

import { POST } from "@/app/api/auth/login/route"

describe("login API", () => {
  beforeEach(() => {
    process.env.AUTH_JWT_SECRET = "test-secret"
    authStoreMocks.findUserByEmail.mockReset()
  })

  afterEach(() => {
    delete process.env.AUTH_JWT_SECRET
  })

  it("autentica usuario com senha", async () => {
    const passwordHash = await hashPassword("senha-segura-123")
    authStoreMocks.findUserByEmail.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      passwordHash,
    })

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

    const payload = (await response.json()) as { user: { email: string } }

    expect(response.status).toBe(200)
    expect(payload.user.email).toBe("ana@example.com")
    expect(response.headers.get("set-cookie")).toContain("financida_auth_token")
    expect(response.headers.get("set-cookie")?.toLowerCase()).toContain(
      "samesite=strict"
    )
  })

  it("rejeita credenciais invalidas", async () => {
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
    expect(authStoreMocks.findUserByEmail).not.toHaveBeenCalled()
  })

  it("retorna erro 400 para JSON de login malformado", async () => {
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
    expect(authStoreMocks.findUserByEmail).not.toHaveBeenCalled()
  })

  it("limita repetidas tentativas de login", async () => {
    authStoreMocks.findUserByEmail.mockResolvedValue(null)

    const statuses = []

    for (let attempt = 0; attempt < 9; attempt += 1) {
      const response = await POST(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "198.51.100.42",
          },
          body: JSON.stringify({
            email: "rate-limit-login@example.com",
            password: "senha-segura-123",
          }),
        })
      )

      statuses.push(response.status)
    }

    expect(statuses.slice(0, 8)).toEqual(Array(8).fill(401))
    expect(statuses.at(-1)).toBe(429)
  })
})
