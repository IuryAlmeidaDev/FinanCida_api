import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const authStoreMocks = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}))

vi.mock("@/lib/auth-store", () => authStoreMocks)

import { POST } from "@/app/api/auth/signup/route"

describe("signup API", () => {
  beforeEach(() => {
    process.env.AUTH_JWT_SECRET = "test-secret"
    authStoreMocks.findUserByEmail.mockReset()
    authStoreMocks.createUser.mockReset()
  })

  afterEach(() => {
    delete process.env.AUTH_JWT_SECRET
  })

  it("cria usuario e retorna cookie JWT", async () => {
    authStoreMocks.findUserByEmail.mockResolvedValue(null)
    authStoreMocks.createUser.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      handle: "ana#1234",
      passwordHash: "hashed-password",
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
    expect(authStoreMocks.createUser).toHaveBeenCalledTimes(1)
    expect(response.headers.get("set-cookie")).toContain("financida_auth_token")
  })

  it("rejeita email duplicado", async () => {
    authStoreMocks.findUserByEmail.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      handle: "ana#1234",
      passwordHash: "hashed-password",
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
    expect(authStoreMocks.createUser).not.toHaveBeenCalled()
  })
})
