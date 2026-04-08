import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)

import { GET } from "@/app/api/crypto/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
}

describe("crypto API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            bitcoin: { usd: 100000, usd_24h_change: 1.2 },
            ethereum: { usd: 3000, usd_24h_change: -0.4 },
            solana: { usd: 180, usd_24h_change: 2.1 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            prices: [
              [Date.UTC(2025, 0, 1), 50000],
              [Date.UTC(2025, 0, 2), 51000],
            ],
          }),
        })
    )
  })

  it("retorna precos e historico para usuario autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)

    const response = await GET(new Request("http://localhost/api/crypto"))
    const payload = (await response.json()) as {
      prices: Array<{ symbol: string }>
      bitcoinHistory: Array<{ value: number }>
    }

    expect(response.status).toBe(200)
    expect(payload.prices.map((item) => item.symbol)).toEqual([
      "BTC",
      "ETH",
      "SOL",
    ])
    expect(payload.bitcoinHistory[0].value).toBe(50000)
  })
})
