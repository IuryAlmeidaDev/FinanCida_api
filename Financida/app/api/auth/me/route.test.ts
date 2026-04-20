import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  authCookieName: "financida_auth_token",
  authRefreshCookieName: "financida_auth_refresh_token",
  readAuthTokenFromCookieHeader: vi.fn(),
  readRefreshTokenFromCookieHeader: vi.fn(),
  getAuthUserFromToken: vi.fn(),
  tryRefreshAuthSession: vi.fn(),
  applySessionCookies: vi.fn(),
  clearAuthCookie: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)

import { GET } from "@/app/api/auth/me/route"

describe("me API", () => {
  beforeEach(() => {
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    authMocks.readRefreshTokenFromCookieHeader.mockReset()
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.tryRefreshAuthSession.mockReset()
    authMocks.applySessionCookies.mockReset()
    authMocks.clearAuthCookie.mockReset()
  })

  it("retorna usuario autenticado com access token valido", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("access-token")
    authMocks.readRefreshTokenFromCookieHeader.mockReturnValue("refresh-token")
    authMocks.getAuthUserFromToken.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      handle: "ana#1234",
    })

    const response = await GET(
      new Request("http://localhost/api/auth/me", {
        headers: {
          cookie:
            "financida_auth_token=access-token; financida_auth_refresh_token=refresh-token",
        },
      })
    )

    const payload = (await response.json()) as { user: { email: string } }

    expect(response.status).toBe(200)
    expect(payload.user.email).toBe("ana@example.com")
    expect(authMocks.applySessionCookies).not.toHaveBeenCalled()
  })

  it("renova sessao com refresh token quando access expirou", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("expired-token")
    authMocks.readRefreshTokenFromCookieHeader.mockReturnValue("refresh-token")
    authMocks.getAuthUserFromToken
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "user-1",
        name: "Ana",
        email: "ana@example.com",
        handle: "ana#1234",
      })
    authMocks.tryRefreshAuthSession.mockResolvedValue({
      session: {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      },
    })

    const response = await GET(new Request("http://localhost/api/auth/me"))

    expect(response.status).toBe(200)
    expect(authMocks.applySessionCookies).toHaveBeenCalledTimes(1)
  })

  it("rejeita sem tokens validos e limpa cookies", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue(undefined)
    authMocks.readRefreshTokenFromCookieHeader.mockReturnValue(undefined)
    authMocks.getAuthUserFromToken.mockResolvedValue(null)
    authMocks.tryRefreshAuthSession.mockResolvedValue(null)

    const response = await GET(new Request("http://localhost/api/auth/me"))

    expect(response.status).toBe(401)
    expect(authMocks.clearAuthCookie).toHaveBeenCalledTimes(1)
  })
})
