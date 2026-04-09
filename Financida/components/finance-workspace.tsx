"use client"

import * as React from "react"

import { Calendar, type CalendarMarker } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/category-badge"
import { CurrencyInput } from "@/components/currency-input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  ExpenseCategory,
  FinanceDataset,
  FixedExpenseStatus,
} from "@/lib/finance"
import {
  addMovementToDataset,
  expenseCategories,
  fixedExpenseStatuses,
  type MovementInput,
} from "@/lib/finance-movements"
import { formatBrazilianDate, moneyFormatter, parseCurrencyInput } from "@/lib/formatters"

type MovementType = "expense" | "revenue"
type RecurrenceType = "unique" | "recurring"

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function parseBrazilianDate(value: string) {
  const [day, month, year] = value.split("/").map(Number)

  if (!day || !month || !year) {
    return undefined
  }

  const date = new Date(year, month - 1, day)

  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return undefined
  }

  return date
}

export function FinanceWorkspace({
  dataset,
  onDatasetChange,
  onMovementCreate,
  showCalendar = true,
  showForm = true,
}: {
  dataset: FinanceDataset
  onDatasetChange: (dataset: FinanceDataset) => void
  onMovementCreate?: (movement: MovementInput) => void | Promise<void>
  showCalendar?: boolean
  showForm?: boolean
}) {
  const currentDate = React.useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = React.useState(currentDate)
  const [dateInput, setDateInput] = React.useState(
    formatBrazilianDate(currentDate)
  )
  const [movementType, setMovementType] = React.useState<MovementType>("expense")
  const [recurrenceType, setRecurrenceType] = React.useState<RecurrenceType>("unique")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<ExpenseCategory>("Moradia")
  const [value, setValue] = React.useState("")
  const [status, setStatus] = React.useState<FixedExpenseStatus>("Em aberto")

  const selectedDateKey = toDateKey(selectedDate)
  const markers = React.useMemo<CalendarMarker[]>(() => {
    const days = new Map<string, { revenue: boolean; expense: boolean }>()

    for (const revenue of dataset.monthlyRevenues) {
      const currentDay = days.get(revenue.date)

      days.set(revenue.date, {
        revenue: true,
        expense: currentDay?.expense ?? false,
      })
    }

    for (const expense of dataset.fixedExpenses) {
      if (!expense.transactionDate) {
        continue
      }

      days.set(expense.transactionDate, {
        revenue: days.get(expense.transactionDate)?.revenue ?? false,
        expense: true,
      })
    }

    for (const expense of dataset.variableExpenses) {
      days.set(expense.date, {
        revenue: days.get(expense.date)?.revenue ?? false,
        expense: true,
      })
    }

    return [...days.entries()].map(([date, marker]) => ({
      date,
      type: marker.revenue && marker.expense ? "both" : marker.revenue ? "revenue" : "expense",
    }))
  }, [dataset])

  const selectedMovements = React.useMemo(() => {
    const revenues = dataset.monthlyRevenues
      .filter((revenue) => revenue.date === selectedDateKey)
      .map((revenue) => ({
        id: revenue.id,
        label: "Receita",
        description: "Receita mensal",
        category: "Receita" as const,
        value: revenue.value,
      }))

    const fixed = dataset.fixedExpenses
      .filter((expense) => expense.transactionDate === selectedDateKey)
      .map((expense) => ({
        id: expense.id,
        label: `Despesa fixa - ${expense.status}`,
        description: expense.description,
        category: expense.category,
        value: expense.value,
      }))

    const variable = dataset.variableExpenses
      .filter((expense) => expense.date === selectedDateKey)
      .map((expense) => ({
        id: expense.id,
        label: "Despesa variável",
        description: expense.description,
        category: expense.category,
        value: expense.value,
      }))

    return [...revenues, ...fixed, ...variable]
  }, [dataset, selectedDateKey])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedValue = parseCurrencyInput(value)

    if (!description.trim() || Number.isNaN(parsedValue) || parsedValue <= 0) {
      return
    }

    const id = crypto.randomUUID()
    const parsedDate = parseBrazilianDate(dateInput)

    if (!parsedDate) {
      return
    }

    const movementDateKey = toDateKey(parsedDate)

    const movement: MovementInput = {
      type: movementType,
      recurrence: recurrenceType,
      date: movementDateKey,
      description,
      category,
      value: parsedValue,
      status,
    }

    if (onMovementCreate) {
      await onMovementCreate(movement)
    } else {
      onDatasetChange(addMovementToDataset(dataset, movement, id))
    }

    setDescription("")
    setValue("")
  }

  return (
    <div
      className={
        showCalendar && showForm
          ? "grid gap-4 px-4 lg:grid-cols-[360px_1fr] lg:px-6"
          : showCalendar
            ? "grid h-full max-w-xl gap-4 px-4 lg:px-6"
          : "grid gap-4 px-4 lg:px-6"
      }
    >
      {showCalendar && (
        <Card className="h-full border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Calendário financeiro</CardTitle>
          <CardDescription>
            Dias com lançamentos ficam marcados com destaque visual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date)
              setDateInput(formatBrazilianDate(date))
            }}
            month={selectedDate}
            markers={markers}
          />
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-sm font-medium">
              Lançamentos de {formatBrazilianDate(selectedDate)}
            </p>
            <div className="mt-3 space-y-2">
              {selectedMovements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma movimentação neste dia.
                </p>
              ) : (
                selectedMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{movement.description}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-muted-foreground">{movement.label}</p>
                        <CategoryBadge category={movement.category} />
                      </div>
                    </div>
                    <span className="font-medium">
                      {moneyFormatter.format(movement.value)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {showForm && (
        <Card className="border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Adicionar movimentação</CardTitle>
          <CardDescription>
            Cadastre receita ou despesa única/recorrente para atualizar o dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="movement-type">Tipo</FieldLabel>
                  <Select
                    value={movementType}
                    onValueChange={(value) => setMovementType(value as MovementType)}
                  >
                    <SelectTrigger id="movement-type" className="h-10 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="revenue">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="recurrence-type">Recorrência</FieldLabel>
                  <Select
                    value={recurrenceType}
                    onValueChange={(value) => setRecurrenceType(value as RecurrenceType)}
                  >
                    <SelectTrigger id="recurrence-type" className="h-10 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="unique">Única</SelectItem>
                      <SelectItem value="recurring">Recorrente</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <Input
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex.: Aluguel, salário, supermercado"
                  required
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="date">Data</FieldLabel>
                  <Input
                    id="date"
                    value={dateInput}
                    onChange={(event) => {
                      setDateInput(event.target.value)
                      const parsedDate = parseBrazilianDate(event.target.value)

                      if (parsedDate) {
                        setSelectedDate(parsedDate)
                      }
                    }}
                    placeholder="dd/mm/aaaa"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="value">Valor</FieldLabel>
                  <CurrencyInput
                    id="value"
                    value={value}
                    onValueChange={(maskedValue) => setValue(maskedValue)}
                    placeholder="0,00"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category">Categoria</FieldLabel>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as ExpenseCategory)}
                  >
                    <SelectTrigger id="category" className="h-10 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {expenseCategories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              {movementType === "expense" && recurrenceType === "recurring" && (
                <Field>
                  <FieldLabel htmlFor="status">Status da despesa fixa</FieldLabel>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as FixedExpenseStatus)}
                  >
                    <SelectTrigger id="status" className="h-10 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {fixedExpenseStatuses.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Despesas vencidas e não pagas entram como atrasadas automaticamente nos cálculos
                  </FieldDescription>
                </Field>
              )}
              <Button type="submit" className="w-full md:w-fit">
                Adicionar movimentação
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
