import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const storageMocks = vi.hoisted(() => ({
  uploadProfileAvatar: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/supabase-storage", () => storageMocks)

import { POST } from "@/app/api/profile/avatar/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
  handle: "ana#1234",
}

describe("profile avatar API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    storageMocks.uploadProfileAvatar.mockReset()
  })

  it("envia avatar para o storage", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    storageMocks.uploadProfileAvatar.mockResolvedValue(
      "https://example.com/avatar.png"
    )

    const formData = new FormData()
    formData.append(
      "file",
      new File(["avatar"], "avatar.png", { type: "image/png" })
    )

    const response = await POST(
      new Request("http://localhost/api/profile/avatar", {
        method: "POST",
        body: formData,
      })
    )

    expect(response.status).toBe(201)
    expect(storageMocks.uploadProfileAvatar).toHaveBeenCalled()
  })
})
