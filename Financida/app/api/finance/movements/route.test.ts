import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { GET, POST } from "@/app/api/finance/movements/route"

let tempDir: string | undefined

describe("finance movements API", () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "financida-test-"))
    process.env.FINANCE_STORE_PATH = path.join(tempDir, "finance-store.json")
  })

  afterEach(async () => {
    delete process.env.FINANCE_STORE_PATH

    if (tempDir) {
      await rm(tempDir, { force: true, recursive: true })
      tempDir = undefined
    }
  })

  it("retorna a lista de movimentacoes", async () => {
    const response = await GET()
    const payload = (await response.json()) as { movements: unknown[] }

    expect(response.status).toBe(200)
    expect(payload.movements.length).toBeGreaterThan(0)
  })

  it("salva uma nova movimentacao", async () => {
    const response = await POST(
      new Request("http://localhost/api/finance/movements", {
        method: "POST",
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
    expect(
      payload.dataset.variableExpenses.some(
        (expense) => expense.description === "Restaurante"
      )
    ).toBe(true)
  })

  it("rejeita movimentacao invalida", async () => {
    const response = await POST(
      new Request("http://localhost/api/finance/movements", {
        method: "POST",
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
})
