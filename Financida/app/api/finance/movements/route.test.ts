import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  getAuthUserFromToken: vi.fn(),
  readAuthTokenFromCookieHeader: vi.fn(),
}))

const financeStoreMocks = vi.hoisted(() => ({
  readFinanceDataset: vi.fn(),
  createFinanceMovement: vi.fn(),
  deleteFinanceMovement: vi.fn(),
}))

vi.mock("@/lib/auth", () => authMocks)
vi.mock("@/lib/finance-store", () => financeStoreMocks)

import { DELETE, GET, POST } from "@/app/api/finance/movements/route"

const authUser = {
  id: "user-1",
  name: "Ana",
  email: "ana@example.com",
}

describe("finance movements API", () => {
  beforeEach(() => {
    authMocks.getAuthUserFromToken.mockReset()
    authMocks.readAuthTokenFromCookieHeader.mockReset()
    financeStoreMocks.readFinanceDataset.mockReset()
    financeStoreMocks.createFinanceMovement.mockReset()
    financeStoreMocks.deleteFinanceMovement.mockReset()
  })

  afterEach(() => {
    delete process.env.AUTH_JWT_SECRET
  })

  it("retorna 401 sem sessao", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue(undefined)
    authMocks.getAuthUserFromToken.mockResolvedValue(null)

    const response = await GET(
      new Request("http://localhost/api/finance/movements")
    )

    expect(response.status).toBe(401)
  })

  it("retorna a lista de movimentacoes autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    financeStoreMocks.readFinanceDataset.mockResolvedValue({
      fixedExpenses: [],
      variableExpenses: [],
      monthlyRevenues: [],
    })

    const response = await GET(
      new Request("http://localhost/api/finance/movements", {
        headers: { cookie: "financida_auth_token=token" },
      })
    )
    const payload = (await response.json()) as { movements: unknown[] }

    expect(response.status).toBe(200)
    expect(payload.movements).toEqual([])
    expect(financeStoreMocks.readFinanceDataset).toHaveBeenCalledWith("user-1")
  })

  it("salva uma nova movimentacao autenticado", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    financeStoreMocks.createFinanceMovement.mockResolvedValue({
      fixedExpenses: [],
      variableExpenses: [
        {
          id: "mov-1",
          date: "2026-04-09",
          description: "Restaurante",
          category: "Alimentacao",
          value: 120,
        },
      ],
      monthlyRevenues: [],
    })

    const response = await POST(
      new Request("http://localhost/api/finance/movements", {
        method: "POST",
        headers: { cookie: "financida_auth_token=token" },
        body: JSON.stringify({
          type: "expense",
          recurrence: "unique",
          date: "2026-04-09",
          description: "Restaurante",
          category: "Alimentacao",
          value: 120,
          status: "Em aberto",
        }),
      })
    )
    const payload = (await response.json()) as {
      dataset: {
        variableExpenses: Array<{ description: string }>
      }
    }

    expect(response.status).toBe(201)
    expect(financeStoreMocks.createFinanceMovement).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        description: "Restaurante",
      })
    )
    expect(
      payload.dataset.variableExpenses.some(
        (expense) => expense.description === "Restaurante"
      )
    ).toBe(true)
  })

  it("rejeita movimentacao invalida", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)

    const response = await POST(
      new Request("http://localhost/api/finance/movements", {
        method: "POST",
        headers: { cookie: "financida_auth_token=token" },
        body: JSON.stringify({
          type: "expense",
          recurrence: "unique",
          date: "2026-04-09",
          description: "",
          category: "Alimentacao",
          value: -10,
        }),
      })
    )

    expect(response.status).toBe(400)
  })

  it("remove uma movimentacao autenticada", async () => {
    authMocks.readAuthTokenFromCookieHeader.mockReturnValue("token")
    authMocks.getAuthUserFromToken.mockResolvedValue(authUser)
    financeStoreMocks.deleteFinanceMovement.mockResolvedValue({
      fixedExpenses: [],
      variableExpenses: [],
      monthlyRevenues: [],
    })

    const response = await DELETE(
      new Request("http://localhost/api/finance/movements", {
        method: "DELETE",
        headers: { cookie: "financida_auth_token=token" },
        body: JSON.stringify({
          id: "mov-1",
          source: "variable-expense",
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(financeStoreMocks.deleteFinanceMovement).toHaveBeenCalledWith(
      "user-1",
      {
        id: "mov-1",
        source: "variable-expense",
      }
    )
  })
})
