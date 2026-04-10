import { z } from "zod"

import type {
  CategoryDefinition,
  ExpenseCategory,
  FinanceDataset,
  FixedExpenseStatus,
} from "@/lib/finance"
import { normalizeFinanceDataset } from "@/lib/finance"

export const expenseCategories = [
  "Moradia",
  "Familia",
  "Educacao",
  "Comunicacao",
  "Transporte",
  "Alimentacao",
  "Saude",
  "Lazer",
  "Outros",
] as const satisfies readonly ExpenseCategory[]

export const fixedExpenseStatuses = [
  "Pendente",
  "Pago",
  "Atrasado",
] as const satisfies readonly FixedExpenseStatus[]

const categoryDefinitionSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.enum([
    "home",
    "users",
    "graduation",
    "wifi",
    "car",
    "utensils",
    "heart",
    "party",
    "tag",
    "wallet",
    "shopping",
    "briefcase",
    "shirt",
    "gamepad",
    "plane",
  ]),
})

export const movementInputSchema = z.object({
  type: z.enum(["expense", "revenue"]),
  recurrence: z.enum(["unique", "recurring"]),
  date: z.iso.date(),
  description: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(40),
  value: z.number().positive(),
  status: z.enum(fixedExpenseStatuses).optional(),
  categoryDefinition: categoryDefinitionSchema.optional(),
})

export type MovementInput = z.infer<typeof movementInputSchema>
export const movementDeleteSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["revenue", "fixed-expense", "variable-expense"]),
})

export type MovementDeleteInput = z.infer<typeof movementDeleteSchema>
export const movementUpdateSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["revenue", "fixed-expense", "variable-expense"]),
  date: z.iso.date(),
  description: z.string().trim().min(1).max(120).optional(),
  category: z.string().trim().min(1).max(40).optional(),
  value: z.number().positive(),
  status: z.enum(fixedExpenseStatuses).optional(),
})

export type MovementUpdateInput = z.infer<typeof movementUpdateSchema>

export type FinanceMovement = {
  id: string
  source: MovementDeleteInput["source"]
  date: string
  description: string
  category: ExpenseCategory | "Receita"
  type: "Receita" | "Despesa fixa" | "Despesa variável"
  value: number
  status: FixedExpenseStatus | "-"
}

function addMonths(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setMonth(date.getMonth() + amount)
  return date.toISOString().slice(0, 10)
}

export function addMovementToDataset(
  dataset: FinanceDataset,
  input: MovementInput,
  id = crypto.randomUUID()
): FinanceDataset {
  const parsedInput = movementInputSchema.parse(input)
  const normalizedDataset = normalizeFinanceDataset(dataset)
  const categories = parsedInput.categoryDefinition
    ? mergeCategoryDefinition(
        normalizedDataset.categories,
        parsedInput.categoryDefinition
      )
    : normalizedDataset.categories

  if (parsedInput.type === "revenue") {
    const monthlyRevenues = Array.from({
      length: parsedInput.recurrence === "recurring" ? 12 : 1,
    }).map((_, index) => ({
      id: `${id}-${index}`,
      date: addMonths(parsedInput.date, index),
      value: parsedInput.value,
    }))

    return {
      ...normalizedDataset,
      categories,
      monthlyRevenues: [...normalizedDataset.monthlyRevenues, ...monthlyRevenues],
    }
  }

  if (parsedInput.recurrence === "recurring") {
    return {
      ...normalizedDataset,
      categories,
      fixedExpenses: [
        ...normalizedDataset.fixedExpenses,
        {
          id,
          transactionDate: parsedInput.date,
          description: parsedInput.description,
          category: parsedInput.category,
          value: parsedInput.value,
          status: parsedInput.status ?? "Pendente",
        },
      ],
    }
  }

  return {
    ...normalizedDataset,
    categories,
    variableExpenses: [
      ...normalizedDataset.variableExpenses,
      {
        id,
        date: parsedInput.date,
        description: parsedInput.description,
        category: parsedInput.category,
        value: parsedInput.value,
      },
    ],
  }
}

export function listFinanceMovements(dataset: FinanceDataset): FinanceMovement[] {
  const normalizedDataset = normalizeFinanceDataset(dataset)

  return [
    ...normalizedDataset.monthlyRevenues.map((revenue) => ({
      id: revenue.id,
      source: "revenue" as const,
      date: revenue.date,
      description: "Receita mensal",
      category: "Receita" as const,
      type: "Receita" as const,
      value: revenue.value,
      status: "-" as const,
    })),
    ...normalizedDataset.fixedExpenses.map((expense) => ({
      id: expense.id,
      source: "fixed-expense" as const,
      date: expense.transactionDate ?? "-",
      description: expense.description,
      category: expense.category,
      type: "Despesa fixa" as const,
      value: expense.value,
      status: expense.status,
    })),
    ...normalizedDataset.variableExpenses.map((expense) => ({
      id: expense.id,
      source: "variable-expense" as const,
      date: expense.date,
      description: expense.description,
      category: expense.category,
      type: "Despesa variável" as const,
      value: expense.value,
      status: "Pendente" as const,
    })),
  ].sort((left, right) => right.date.localeCompare(left.date))
}

export function mergeCategoryDefinition(
  categories: CategoryDefinition[],
  nextCategory: CategoryDefinition
) {
  const sanitized = categoryDefinitionSchema.parse(nextCategory)
  const existingIndex = categories.findIndex(
    (category) => category.name === sanitized.name
  )

  if (existingIndex === -1) {
    return [...categories, sanitized]
  }

  const nextCategories = [...categories]
  nextCategories[existingIndex] = sanitized
  return nextCategories
}
