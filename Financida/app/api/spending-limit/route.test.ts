import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const spendingLimitMocks = vi.hoisted(() => ({
  readSpendingLimit: vi.fn(),
  spendingLimitInputSchema: {
    parse: vi.fn((input) => input),
  },
  writeSpendingLimit: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/spending-limit-store", () => spendingLimitMocks)

import { GET, PUT } from "@/app/api/spending-limit/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
  handle: "ana#1234",
}

describe("spending limit API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    spendingLimitMocks.readSpendingLimit.mockReset()
    spendingLimitMocks.writeSpendingLimit.mockReset()
  })

  it("retorna o limite salvo do usuario autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    spendingLimitMocks.readSpendingLimit.mockResolvedValue(8000)

    const response = await GET(new Request("http://localhost/api/spending-limit"))

    expect(response.status).toBe(200)
    expect(spendingLimitMocks.readSpendingLimit).toHaveBeenCalledWith("user-1")
  })

  it("salva o limite do usuario autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    spendingLimitMocks.writeSpendingLimit.mockResolvedValue(9000)

    const response = await PUT(
      new Request("http://localhost/api/spending-limit", {
        method: "PUT",
        body: JSON.stringify({ monthlyLimit: 9000 }),
      })
    )

    expect(response.status).toBe(200)
    expect(spendingLimitMocks.writeSpendingLimit).toHaveBeenCalledWith(
      "user-1",
      { monthlyLimit: 9000 }
    )
  })
})
