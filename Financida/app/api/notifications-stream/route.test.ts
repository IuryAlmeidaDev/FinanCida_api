import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const notificationsMocks = vi.hoisted(() => ({
  listNotifications: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/notifications-store", () => notificationsMocks)

import { GET } from "@/app/api/notifications-stream/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
  handle: "ana#1234",
}

describe("notifications stream API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    notificationsMocks.listNotifications.mockReset()
  })

  it("abre stream autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    notificationsMocks.listNotifications.mockResolvedValue([])

    const response = await GET(new Request("http://localhost/api/notifications-stream"))

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toContain("text/event-stream")
  })
})
