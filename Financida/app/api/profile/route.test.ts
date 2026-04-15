import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const profileMocks = vi.hoisted(() => ({
  profileUpdateSchema: {
    parse: vi.fn((input) => input),
  },
  readUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/profile-store", () => profileMocks)

import { GET, PUT } from "@/app/api/profile/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
  handle: "ana#1234",
}

describe("profile API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    profileMocks.readUserProfile.mockReset()
    profileMocks.updateUserProfile.mockReset()
  })

  it("retorna o perfil do usuario autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    profileMocks.readUserProfile.mockResolvedValue({
      displayName: "Ana",
      avatarUrl: null,
      avatarOffsetX: 0,
      avatarOffsetY: 0,
      avatarZoom: 1,
    })

    const response = await GET(new Request("http://localhost/api/profile"))

    expect(response.status).toBe(200)
    expect(profileMocks.readUserProfile).toHaveBeenCalledWith("user-1")
  })

  it("atualiza o perfil do usuario autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    profileMocks.updateUserProfile.mockResolvedValue({
      displayName: "Ana Silva",
      avatarUrl: "https://example.com/avatar.png",
      avatarOffsetX: 10,
      avatarOffsetY: -5,
      avatarZoom: 1.2,
    })

    const response = await PUT(
      new Request("http://localhost/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: "Ana Silva",
          avatarUrl: "https://example.com/avatar.png",
          avatarOffsetX: 10,
          avatarOffsetY: -5,
          avatarZoom: 1.2,
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(profileMocks.updateUserProfile).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        displayName: "Ana Silva",
      })
    )
  })
})
