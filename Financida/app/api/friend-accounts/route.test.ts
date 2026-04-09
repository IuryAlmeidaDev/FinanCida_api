import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const accountsMocks = vi.hoisted(() => ({
  createFriendAccount: vi.fn(),
  friendAccountAcceptSchema: {
    parse: vi.fn((input) => input),
  },
  handleFriendAccountDecision: vi.fn(),
  listFriendAccounts: vi.fn(),
  friendAccountInputSchema: {
    parse: vi.fn((input) => input),
  },
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/friend-accounts-store", () => accountsMocks)

import { GET, PATCH, POST } from "@/app/api/friend-accounts/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
  handle: "ana#1234",
}

describe("friend accounts API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    accountsMocks.createFriendAccount.mockReset()
    accountsMocks.handleFriendAccountDecision.mockReset()
    accountsMocks.listFriendAccounts.mockReset()
  })

  it("lista contas do usuario autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    accountsMocks.listFriendAccounts.mockResolvedValue([])

    const response = await GET(
      new Request("http://localhost/api/friend-accounts")
    )

    expect(response.status).toBe(200)
    expect(accountsMocks.listFriendAccounts).toHaveBeenCalledWith("user-1")
  })

  it("cria conta para o usuario autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    accountsMocks.createFriendAccount.mockResolvedValue([])

    const response = await POST(
      new Request("http://localhost/api/friend-accounts", {
        method: "POST",
        body: JSON.stringify({
          friendUserId: "friend-1",
          description: "Emprestimo",
          category: "Outros",
          note: "Divisao do jantar",
          totalAmount: 500,
          recurrenceType: "installment",
          installments: 2,
          paymentDates: ["2026-04-10", "2026-05-10"],
        }),
      })
    )

    expect(response.status).toBe(201)
    expect(accountsMocks.createFriendAccount).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ totalAmount: 500 })
    )
  })

  it("aceita uma conta compartilhada pendente", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    accountsMocks.handleFriendAccountDecision.mockResolvedValue([])

    const response = await PATCH(
      new Request("http://localhost/api/friend-accounts", {
        method: "PATCH",
        body: JSON.stringify({ accountId: "account-1", action: "accept" }),
      })
    )

    expect(response.status).toBe(200)
    expect(accountsMocks.handleFriendAccountDecision).toHaveBeenCalledWith(
      "user-1",
      { accountId: "account-1", action: "accept" }
    )
  })
})
