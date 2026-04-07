import { z } from "zod"

import type {
  ExpenseCategory,
  FinanceDataset,
  FixedExpenseStatus,
} from "@/lib/finance"

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
  "Em aberto",
  "Pago",
  "Atrasado",
] as const satisfies readonly FixedExpenseStatus[]

export const movementInputSchema = z.object({
  type: z.enum(["expense", "revenue"]),
  recurrence: z.enum(["unique", "recurring"]),
  date: z.iso.date(),
  description: z.string().trim().min(1).max(120),
  category: z.enum(expenseCategories),
  value: z.number().positive(),
  status: z.enum(fixedExpenseStatuses).optional(),
})

export type MovementInput = z.infer<typeof movementInputSchema>

export type FinanceMovement = {
  id: string
  date: string
  description: string
  category: ExpenseCategory | "Receita"
  type: "Receita" | "Despesa fixa" | "Despesa variavel"
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

  if (parsedInput.type === "revenue") {
    const monthlyRevenues = Array.from({
      length: parsedInput.recurrence === "recurring" ? 12 : 1,
    }).map((_, index) => ({
      id: `${id}-${index}`,
      date: addMonths(parsedInput.date, index),
      value: parsedInput.value,
    }))

    return {
      ...dataset,
      monthlyRevenues: [...dataset.monthlyRevenues, ...monthlyRevenues],
    }
  }

  if (parsedInput.recurrence === "recurring") {
    return {
      ...dataset,
      fixedExpenses: [
        ...dataset.fixedExpenses,
        {
          id,
          transactionDate: parsedInput.date,
          description: parsedInput.description,
          category: parsedInput.category,
          value: parsedInput.value,
          status: parsedInput.status ?? "Em aberto",
        },
      ],
    }
  }

  return {
    ...dataset,
    variableExpenses: [
      ...dataset.variableExpenses,
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
  return [
    ...dataset.monthlyRevenues.map((revenue) => ({
      id: revenue.id,
      date: revenue.date,
      description: "Receita mensal",
      category: "Receita" as const,
      type: "Receita" as const,
      value: revenue.value,
      status: "-" as const,
    })),
    ...dataset.fixedExpenses.map((expense) => ({
      id: expense.id,
      date: expense.transactionDate ?? "-",
      description: expense.description,
      category: expense.category,
      type: "Despesa fixa" as const,
      value: expense.value,
      status: expense.status,
    })),
    ...dataset.variableExpenses.map((expense) => ({
      id: expense.id,
      date: expense.date,
      description: expense.description,
      category: expense.category,
      type: "Despesa variavel" as const,
      value: expense.value,
      status: "-" as const,
    })),
  ].sort((left, right) => right.date.localeCompare(left.date))
}
