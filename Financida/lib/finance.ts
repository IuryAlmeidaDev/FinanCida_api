export type FixedExpenseStatus = "Em aberto" | "Pago" | "Atrasado"

export type ExpenseCategory =
  | "Moradia"
  | "Familia"
  | "Educacao"
  | "Comunicacao"
  | "Transporte"
  | "Alimentacao"
  | "Saude"
  | "Lazer"
  | "Outros"

export type MonthYear = {
  month: number
  year: number
}

export type FixedExpense = {
  id: string
  transactionDate?: string
  description: string
  category: ExpenseCategory
  value: number
  status: FixedExpenseStatus
}

export type VariableExpense = {
  id: string
  date: string
  description: string
  category: ExpenseCategory
  value: number
}

export type MonthlyRevenue = {
  id: string
  date: string
  value: number
}

export type CategoryTotal = {
  category: ExpenseCategory
  total: number
}

export type FinancialSummary = {
  totalRevenue: number
  totalFixedExpenses: number
  totalVariableExpenses: number
  totalExpenses: number
  operationalBalance: number
  totalOpen: number
  totalLate: number
  totalPaid: number
  totalToPay: number
  expenseGrowthRate: number
  categoryTotals: CategoryTotal[]
}

export type FinanceDataset = {
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  monthlyRevenues: MonthlyRevenue[]
}

function toDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

function isInMonthYear(dateValue: string | undefined, range: MonthYear) {
  const date = toDate(dateValue)

  if (!date) {
    return false
  }

  return date.getMonth() + 1 === range.month && date.getFullYear() === range.year
}

export function normalizeFixedExpenseStatus(
  expense: FixedExpense,
  currentDate = new Date()
): FixedExpense {
  const transactionDate = toDate(expense.transactionDate)

  if (
    expense.status !== "Pago" &&
    transactionDate &&
    transactionDate < currentDate
  ) {
    return { ...expense, status: "Atrasado" }
  }

  return expense
}

export function filterFinanceDatasetByMonthYear(
  dataset: FinanceDataset,
  range: MonthYear
): FinanceDataset {
  return {
    fixedExpenses: dataset.fixedExpenses.filter((expense) =>
      isInMonthYear(expense.transactionDate, range)
    ),
    variableExpenses: dataset.variableExpenses.filter((expense) =>
      isInMonthYear(expense.date, range)
    ),
    monthlyRevenues: dataset.monthlyRevenues.filter((revenue) =>
      isInMonthYear(revenue.date, range)
    ),
  }
}

export function getPreviousMonthYear(range: MonthYear): MonthYear {
  if (range.month === 1) {
    return { month: 12, year: range.year - 1 }
  }

  return { month: range.month - 1, year: range.year }
}

export function sumByValue<T extends { value: number }>(items: T[]) {
  return items.reduce((total, item) => total + item.value, 0)
}

export function groupExpensesByCategory(
  fixedExpenses: FixedExpense[],
  variableExpenses: VariableExpense[]
): CategoryTotal[] {
  const totals = new Map<ExpenseCategory, number>()

  for (const expense of [...fixedExpenses, ...variableExpenses]) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.value)
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total)
}

export function calculateExpenseGrowthRate(
  currentExpenses: number,
  previousExpenses: number
) {
  if (previousExpenses === 0) {
    return currentExpenses > 0 ? 100 : 0
  }

  return ((currentExpenses - previousExpenses) / previousExpenses) * 100
}

export function calculateFinancialSummary(
  dataset: FinanceDataset,
  range: MonthYear,
  currentDate = new Date()
): FinancialSummary {
  const currentDataset = filterFinanceDatasetByMonthYear(dataset, range)
  const previousDataset = filterFinanceDatasetByMonthYear(
    dataset,
    getPreviousMonthYear(range)
  )

  const fixedExpenses = currentDataset.fixedExpenses.map((expense) =>
    normalizeFixedExpenseStatus(expense, currentDate)
  )
  const previousFixedExpenses = previousDataset.fixedExpenses.map((expense) =>
    normalizeFixedExpenseStatus(expense, currentDate)
  )

  const totalRevenue = sumByValue(currentDataset.monthlyRevenues)
  const totalFixedExpenses = sumByValue(fixedExpenses)
  const totalVariableExpenses = sumByValue(currentDataset.variableExpenses)
  const totalExpenses = totalFixedExpenses + totalVariableExpenses
  const previousTotalExpenses =
    sumByValue(previousFixedExpenses) + sumByValue(previousDataset.variableExpenses)

  const totalOpen = sumByValue(
    fixedExpenses.filter((expense) => expense.status === "Em aberto")
  )
  const totalLate = sumByValue(
    fixedExpenses.filter((expense) => expense.status === "Atrasado")
  )
  const totalPaid = sumByValue(
    fixedExpenses.filter((expense) => expense.status === "Pago")
  )

  return {
    totalRevenue,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    operationalBalance: totalRevenue - totalExpenses,
    totalOpen,
    totalLate,
    totalPaid,
    totalToPay: totalVariableExpenses + totalOpen + totalLate,
    expenseGrowthRate: calculateExpenseGrowthRate(
      totalExpenses,
      previousTotalExpenses
    ),
    categoryTotals: groupExpensesByCategory(
      fixedExpenses,
      currentDataset.variableExpenses
    ),
  }
}
