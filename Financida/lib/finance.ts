export type FixedExpenseStatus = "Pendente" | "Pago" | "Atrasado"
export type ExpenseCategory = string
export type CategoryIconName =
  | "home"
  | "users"
  | "graduation"
  | "wifi"
  | "car"
  | "utensils"
  | "heart"
  | "party"
  | "tag"
  | "wallet"
  | "shopping"
  | "briefcase"
  | "shirt"
  | "gamepad"
  | "plane"

export type CategoryDefinition = {
  name: ExpenseCategory
  color: string
  icon: CategoryIconName
}

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
  categories: CategoryDefinition[]
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  monthlyRevenues: MonthlyRevenue[]
}

export const defaultFinanceCategories: CategoryDefinition[] = [
  { name: "Moradia", color: "#64748b", icon: "home" },
  { name: "Familia", color: "#e11d48", icon: "users" },
  { name: "Educacao", color: "#4f46e5", icon: "graduation" },
  { name: "Comunicacao", color: "#0891b2", icon: "wifi" },
  { name: "Transporte", color: "#d97706", icon: "car" },
  { name: "Alimentacao", color: "#ea580c", icon: "utensils" },
  { name: "Saude", color: "#dc2626", icon: "heart" },
  { name: "Lazer", color: "#c026d3", icon: "party" },
  { name: "Outros", color: "#71717a", icon: "tag" },
] satisfies CategoryDefinition[]

export function createEmptyFinanceDataset(): FinanceDataset {
  return {
    categories: defaultFinanceCategories,
    fixedExpenses: [],
    variableExpenses: [],
    monthlyRevenues: [],
  }
}

export function normalizeFinanceDataset(dataset: Partial<FinanceDataset>): FinanceDataset {
  const categories = dataset.categories?.length
    ? dataset.categories
    : defaultFinanceCategories

  return {
    categories: categories.map((category) => ({ ...category })),
    fixedExpenses: dataset.fixedExpenses ?? [],
    variableExpenses: dataset.variableExpenses ?? [],
    monthlyRevenues: dataset.monthlyRevenues ?? [],
  }
}

export function getCategoryDefinition(
  dataset: Pick<FinanceDataset, "categories">,
  category: ExpenseCategory
) {
  return (
    dataset.categories.find((item) => item.name === category) ?? {
      name: category,
      color: "#71717a",
      icon: "tag" as const,
    }
  )
}

export function getCurrentMonthYear(referenceDate = new Date()): MonthYear {
  return {
    month: referenceDate.getMonth() + 1,
    year: referenceDate.getFullYear(),
  }
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
    categories: dataset.categories,
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
  const totals = new Map<string, number>()

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
    fixedExpenses.filter((expense) => expense.status === "Pendente")
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
