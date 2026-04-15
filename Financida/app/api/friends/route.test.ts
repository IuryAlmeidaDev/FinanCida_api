import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const friendsMocks = vi.hoisted(() => ({
  acceptFriendRequest: vi.fn(),
  friendRequestActionSchema: {
    parse: vi.fn((input) => input),
  },
  friendRequestInputSchema: {
    parse: vi.fn((input) => input),
  },
  listFriends: vi.fn(),
  listPendingFriendRequests: vi.fn(),
  sendFriendRequest: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/friends-store", () => friendsMocks)

import { GET, PATCH, POST } from "@/app/api/friends/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
  handle: "ana#1234",
}

describe("friends API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    friendsMocks.acceptFriendRequest.mockReset()
    friendsMocks.listFriends.mockReset()
    friendsMocks.listPendingFriendRequests.mockReset()
    friendsMocks.sendFriendRequest.mockReset()
  })

  it("retorna amigos e pendencias", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    friendsMocks.listFriends.mockResolvedValue([])
    friendsMocks.listPendingFriendRequests.mockResolvedValue([])

    const response = await GET(new Request("http://localhost/api/friends"))

    expect(response.status).toBe(200)
    expect(friendsMocks.listFriends).toHaveBeenCalledWith("user-1")
  })

  it("envia convite para amigo", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)

    const response = await POST(
      new Request("http://localhost/api/friends", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: "joao#7777" }),
      })
    )

    expect(response.status).toBe(201)
    expect(friendsMocks.sendFriendRequest).toHaveBeenCalledWith(
      "user-1",
      "joao#7777"
    )
  })

  it("aceita um convite pendente", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    friendsMocks.listFriends.mockResolvedValue([])
    friendsMocks.listPendingFriendRequests.mockResolvedValue([])

    const response = await PATCH(
      new Request("http://localhost/api/friends", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ friendshipId: "friendship-1" }),
      })
    )

    expect(response.status).toBe(200)
    expect(friendsMocks.acceptFriendRequest).toHaveBeenCalledWith(
      "user-1",
      "friendship-1"
    )
  })
})
