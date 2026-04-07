"use client"

import * as React from "react"

import { Calendar, type CalendarMarker } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
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
import type {
  ExpenseCategory,
  FinanceDataset,
  FixedExpenseStatus,
} from "@/lib/finance"
import {
  addMovementToDataset,
  type MovementInput,
} from "@/lib/finance-movements"

type MovementType = "expense" | "revenue"
type RecurrenceType = "unique" | "recurring"

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatBrazilianDate(date: Date) {
  return date.toLocaleDateString("pt-BR")
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
  const [selectedDate, setSelectedDate] = React.useState(new Date("2026-04-07T00:00:00"))
  const [dateInput, setDateInput] = React.useState("07/04/2026")
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
        value: revenue.value,
      }))

    const fixed = dataset.fixedExpenses
      .filter((expense) => expense.transactionDate === selectedDateKey)
      .map((expense) => ({
        id: expense.id,
        label: `Despesa fixa - ${expense.status}`,
        description: expense.description,
        value: expense.value,
      }))

    const variable = dataset.variableExpenses
      .filter((expense) => expense.date === selectedDateKey)
      .map((expense) => ({
        id: expense.id,
        label: "Despesa variavel",
        description: expense.description,
        value: expense.value,
      }))

    return [...revenues, ...fixed, ...variable]
  }, [dataset, selectedDateKey])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedValue = Number(value.replace(",", "."))

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
          <CardTitle>Calendario financeiro</CardTitle>
          <CardDescription>
            Dias com lancamentos ficam marcados com borda e ponto preto.
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
              Lancamentos de {formatBrazilianDate(selectedDate)}
            </p>
            <div className="mt-3 space-y-2">
              {selectedMovements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma movimentacao neste dia.
                </p>
              ) : (
                selectedMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{movement.description}</p>
                      <p className="text-xs text-muted-foreground">{movement.label}</p>
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
          <CardTitle>Adicionar movimentacao</CardTitle>
          <CardDescription>
            Cadastre receita ou despesa unica/recorrente para atualizar o dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="movement-type">Tipo</FieldLabel>
                  <select
                    id="movement-type"
                    className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                    value={movementType}
                    onChange={(event) => setMovementType(event.target.value as MovementType)}
                  >
                    <option value="expense">Despesa</option>
                    <option value="revenue">Receita</option>
                  </select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="recurrence-type">Recorrencia</FieldLabel>
                  <select
                    id="recurrence-type"
                    className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                    value={recurrenceType}
                    onChange={(event) => setRecurrenceType(event.target.value as RecurrenceType)}
                  >
                    <option value="unique">Unica</option>
                    <option value="recurring">Recorrente</option>
                  </select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="description">Descricao</FieldLabel>
                <Input
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex: Aluguel, salario, supermercado"
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
                  <Input
                    id="value"
                    inputMode="decimal"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="0,00"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category">Categoria</FieldLabel>
                  <select
                    id="category"
                    className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as ExpenseCategory)
                    }
                  >
                    <option>Moradia</option>
                    <option>Familia</option>
                    <option>Educacao</option>
                    <option>Comunicacao</option>
                    <option>Transporte</option>
                    <option>Alimentacao</option>
                    <option>Saude</option>
                    <option>Lazer</option>
                    <option>Outros</option>
                  </select>
                </Field>
              </div>
              {movementType === "expense" && recurrenceType === "recurring" && (
                <Field>
                  <FieldLabel htmlFor="status">Status da despesa fixa</FieldLabel>
                  <select
                    id="status"
                    className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as FixedExpenseStatus)}
                  >
                    <option>Em aberto</option>
                    <option>Pago</option>
                    <option>Atrasado</option>
                  </select>
                  <FieldDescription>
                    Despesas vencidas e nao pagas entram como atrasadas automaticamente nos calculos.
                  </FieldDescription>
                </Field>
              )}
              <Button type="submit" className="w-full md:w-fit">
                Adicionar movimentacao
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
