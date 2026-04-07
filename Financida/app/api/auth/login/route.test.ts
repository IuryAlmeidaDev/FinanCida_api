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
  })

  it("rejeita credenciais invalidas", async () => {
    authStoreMocks.findUserByEmail.mockResolvedValue(null)

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "ana@example.com",
          password: "senha-segura-123",
        }),
      })
    )

    expect(response.status).toBe(401)
  })
})