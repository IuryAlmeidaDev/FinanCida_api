import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const notificationsMocks = vi.hoisted(() => ({
  listNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/notifications-store", () => notificationsMocks)

import { GET, PATCH } from "@/app/api/notifications/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
  handle: "ana#1234",
}

describe("notifications API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    notificationsMocks.listNotifications.mockReset()
    notificationsMocks.markNotificationAsRead.mockReset()
  })

  it("lista notificacoes do usuario autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    notificationsMocks.listNotifications.mockResolvedValue([])

    const response = await GET(new Request("http://localhost/api/notifications"))

    expect(response.status).toBe(200)
    expect(notificationsMocks.listNotifications).toHaveBeenCalledWith("user-1")
  })

  it("marca notificacao como lida", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)

    const response = await PATCH(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: "notification-1" }),
      })
    )

    expect(response.status).toBe(200)
    expect(notificationsMocks.markNotificationAsRead).toHaveBeenCalledWith(
      "user-1",
      "notification-1"
    )
  })
})
