import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { authCookieName, signAuthToken } from "@/lib/auth"
import { GET } from "@/app/api/auth/me/route"

describe("me API", () => {
  beforeEach(() => {
    process.env.AUTH_JWT_SECRET = "test-secret"
  })

  afterEach(() => {
    delete process.env.AUTH_JWT_SECRET
  })

  it("retorna usuario autenticado", async () => {
    const token = await signAuthToken({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
    })

    const response = await GET(
      new Request("http://localhost/api/auth/me", {
        headers: {
          cookie: `${authCookieName}=${token}`,
        },
      })
    )

    const payload = (await response.json()) as { user: { email: string } }

    expect(response.status).toBe(200)
    expect(payload.user.email).toBe("ana@example.com")
  })

  it("rejeita sem cookie", async () => {
    const response = await GET(new Request("http://localhost/api/auth/me"))

    expect(response.status).toBe(401)
  })
})