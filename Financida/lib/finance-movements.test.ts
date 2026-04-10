import { describe, expect, it } from "vitest"

import {
  addMovementToDataset,
  listFinanceMovements,
  movementInputSchema,
} from "@/lib/finance-movements"
import { financeDataset } from "@/lib/finance-sample-data"

describe("finance movements", () => {
  it("adiciona despesa única como despesa variável", () => {
    const dataset = addMovementToDataset(
      financeDataset,
      {
        type: "expense",
        recurrence: "unique",
        date: "2026-04-08",
        description: "Almoço",
        category: "Alimentacao",
        value: 45.9,
        status: "Pendente",
      },
      "test-expense"
    )

    expect(dataset.variableExpenses.at(-1)).toMatchObject({
      id: "test-expense",
      date: "2026-04-08",
      description: "Almoço",
      category: "Alimentacao",
      value: 45.9,
    })
  })

  it("adiciona receita recorrente por 12 meses", () => {
    const dataset = addMovementToDataset(
      financeDataset,
      {
        type: "revenue",
        recurrence: "recurring",
        date: "2026-04-01",
        description: "Salário",
        category: "Outros",
        value: 5000,
      },
      "test-revenue"
    )

    const createdRevenues = dataset.monthlyRevenues.filter((revenue) =>
      revenue.id.startsWith("test-revenue")
    )

    expect(createdRevenues).toHaveLength(12)
    expect(createdRevenues[0]).toMatchObject({
      id: "test-revenue-0",
      date: "2026-04-01",
      value: 5000,
    })
    expect(createdRevenues[11]).toMatchObject({
      id: "test-revenue-11",
      date: "2027-03-01",
      value: 5000,
    })
  })

  it("lista movimentações unificadas", () => {
    const movements = listFinanceMovements(financeDataset)

    expect(movements.some((movement) => movement.type === "Receita")).toBe(true)
    expect(movements.some((movement) => movement.type === "Despesa fixa")).toBe(true)
    expect(movements.some((movement) => movement.type === "Despesa variável")).toBe(true)
  })

  it("valida entrada inválida", () => {
    expect(() =>
      movementInputSchema.parse({
        type: "expense",
        recurrence: "unique",
        date: "2026-04-08",
        description: "",
        category: "Alimentacao",
        value: -1,
      })
    ).toThrow()
  })
})
