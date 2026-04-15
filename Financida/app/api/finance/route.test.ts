import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const financeStoreMocks = vi.hoisted(() => ({
  readFinanceDataset: vi.fn(),
  writeFinanceDataset: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/finance-store", () => financeStoreMocks)

import { PUT } from "@/app/api/finance/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
  handle: "ana#1234",
}

describe("finance API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    financeStoreMocks.readFinanceDataset.mockReset()
    financeStoreMocks.writeFinanceDataset.mockReset()
  })

  it("rejeita atualizacao financeira vinda de outra origem", async () => {
    const response = await PUT(
      new Request("http://localhost/api/finance", {
        method: "PUT",
        headers: {
          origin: "https://evil.example",
        },
        body: JSON.stringify({ categories: [] }),
      })
    )

    expect(response.status).toBe(403)
    expect(financeStoreMocks.writeFinanceDataset).not.toHaveBeenCalled()
  })

  it("rejeita dataset financeiro invalido antes de escrever no banco", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)

    const response = await PUT(
      new Request("http://localhost/api/finance", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          monthlyRevenues: [
            {
              id: "revenue-1",
              date: "data-invalida",
              value: 1000,
            },
          ],
        }),
      })
    )

    expect(response.status).toBe(400)
    expect(financeStoreMocks.writeFinanceDataset).not.toHaveBeenCalled()
  })

  it("rejeita payload financeiro grande demais", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)

    const response = await PUT(
      new Request("http://localhost/api/finance", {
        method: "PUT",
        headers: {
          "content-length": `${512 * 1024 + 1}`,
        },
        body: JSON.stringify({ categories: [] }),
      })
    )

    expect(response.status).toBe(413)
    expect(financeStoreMocks.writeFinanceDataset).not.toHaveBeenCalled()
  })

  it("rejeita content type inesperado em atualizacao financeira", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)

    const response = await PUT(
      new Request("http://localhost/api/finance", {
        method: "PUT",
        headers: {
          "content-type": "text/plain",
        },
        body: JSON.stringify({ categories: [] }),
      })
    )

    expect(response.status).toBe(415)
    expect(financeStoreMocks.writeFinanceDataset).not.toHaveBeenCalled()
  })
})
