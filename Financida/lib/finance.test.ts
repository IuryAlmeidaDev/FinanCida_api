import { describe, expect, it } from "vitest"

import {
  calculateFinancialSummary,
  filterFinanceDatasetByMonthYear,
  normalizeFinanceDataset,
} from "@/lib/finance"
import { financeDataset } from "@/lib/finance-sample-data"

describe("finance business rules", () => {
  it("calcula totais, saldo e totais por status do mes", () => {
    const summary = calculateFinancialSummary(
      financeDataset,
      { month: 4, year: 2026 },
      new Date("2026-04-07T00:00:00")
    )

    expect(summary.totalRevenue).toBe(7200)
    expect(summary.totalFixedExpenses).toBe(3619.9)
    expect(summary.totalVariableExpenses).toBe(966.45)
    expect(summary.totalExpenses).toBeCloseTo(4586.35)
    expect(summary.operationalBalance).toBeCloseTo(2613.65)
    expect(summary.totalPaid).toBe(2200)
    expect(summary.totalLate).toBe(510)
    expect(summary.totalOpen).toBe(909.9)
    expect(summary.totalToPay).toBeCloseTo(2386.35)
  })

  it("filtra receitas e despesas por mes e ano", () => {
    const aprilDataset = filterFinanceDatasetByMonthYear(financeDataset, {
      month: 4,
      year: 2026,
    })

    expect(aprilDataset.fixedExpenses).toHaveLength(4)
    expect(aprilDataset.variableExpenses).toHaveLength(3)
    expect(aprilDataset.monthlyRevenues).toHaveLength(1)
  })

  it("rejeita datasets financeiros grandes demais", () => {
    expect(() =>
      normalizeFinanceDataset({
        categories: Array.from({ length: 61 }, (_, index) => ({
          name: `Categoria ${index}`,
          color: "#71717a",
          icon: "tag",
        })),
      })
    ).toThrow()
  })

  it("rejeita valores financeiros fora do limite", () => {
    expect(() =>
      normalizeFinanceDataset({
        monthlyRevenues: [
          {
            id: "revenue-1",
            date: "2026-04-01",
            value: Number.POSITIVE_INFINITY,
          },
        ],
      })
    ).toThrow()
  })
})
