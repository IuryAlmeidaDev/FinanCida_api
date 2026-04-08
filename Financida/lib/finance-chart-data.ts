import type { FinanceDataset, MonthYear } from "@/lib/finance"

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
})

function createMonthDate(range: MonthYear, offset: number) {
  return new Date(range.year, range.month - 1 + offset, 1)
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function getDateMonthKey(value?: string) {
  return value ? value.slice(0, 7) : undefined
}

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export function buildMonthlyFinanceChartData(
  dataset: FinanceDataset,
  range: MonthYear,
  months: number
) {
  return Array.from({ length: months }, (_, index) => {
    const date = createMonthDate(range, index - (months - 1))
    const monthKey = toMonthKey(date)
    const receita = sumValues(
      dataset.monthlyRevenues
        .filter((revenue) => getDateMonthKey(revenue.date) === monthKey)
        .map((revenue) => revenue.value)
    )
    const despesa = sumValues([
      ...dataset.fixedExpenses
        .filter((expense) => getDateMonthKey(expense.transactionDate) === monthKey)
        .map((expense) => expense.value),
      ...dataset.variableExpenses
        .filter((expense) => getDateMonthKey(expense.date) === monthKey)
        .map((expense) => expense.value),
    ])

    return {
      month: monthFormatter.format(date).replace(".", ""),
      receita,
      despesa,
      saldo: receita - despesa,
    }
  })
}
