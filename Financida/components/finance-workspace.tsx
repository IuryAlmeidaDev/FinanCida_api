"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
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
import type { FinanceDataset, FixedExpenseStatus } from "@/lib/finance"

type MovementType = "expense" | "revenue"
type RecurrenceType = "unique" | "recurring"

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addMonths(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setMonth(date.getMonth() + amount)
  return toDateKey(date)
}

export function FinanceWorkspace({
  dataset,
  onDatasetChange,
}: {
  dataset: FinanceDataset
  onDatasetChange: (dataset: FinanceDataset) => void
}) {
  const [selectedDate, setSelectedDate] = React.useState(new Date("2026-04-07T00:00:00"))
  const [movementType, setMovementType] = React.useState<MovementType>("expense")
  const [recurrenceType, setRecurrenceType] = React.useState<RecurrenceType>("unique")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState("Moradia")
  const [value, setValue] = React.useState("")
  const [status, setStatus] = React.useState<FixedExpenseStatus>("Em aberto")

  const selectedDateKey = toDateKey(selectedDate)
  const markers = React.useMemo(() => {
    const days = new Map<string, { revenue: boolean; expense: boolean }>()

    for (const revenue of dataset.monthlyRevenues) {
      days.set(revenue.date, { ...(days.get(revenue.date) ?? {}), revenue: true, expense: days.get(revenue.date)?.expense ?? false })
    }

    for (const expense of [...dataset.fixedExpenses, ...dataset.variableExpenses]) {
      const date = "transactionDate" in expense ? expense.transactionDate : expense.date

      if (!date) {
        continue
      }

      days.set(date, { revenue: days.get(date)?.revenue ?? false, expense: true })
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedValue = Number(value.replace(",", "."))

    if (!description.trim() || Number.isNaN(parsedValue) || parsedValue <= 0) {
      return
    }

    const id = crypto.randomUUID()

    if (movementType === "revenue") {
      const revenues = Array.from({
        length: recurrenceType === "recurring" ? 12 : 1,
      }).map((_, index) => ({
        id: `${id}-${index}`,
        date: addMonths(selectedDateKey, index),
        value: parsedValue,
      }))

      onDatasetChange({
        ...dataset,
        monthlyRevenues: [...dataset.monthlyRevenues, ...revenues],
      })
    } else if (recurrenceType === "recurring") {
      onDatasetChange({
        ...dataset,
        fixedExpenses: [
          ...dataset.fixedExpenses,
          {
            id,
            transactionDate: selectedDateKey,
            description,
            category: category as never,
            value: parsedValue,
            status,
          },
        ],
      })
    } else {
      onDatasetChange({
        ...dataset,
        variableExpenses: [
          ...dataset.variableExpenses,
          {
            id,
            date: selectedDateKey,
            description,
            category: category as never,
            value: parsedValue,
          },
        ],
      })
    }

    setDescription("")
    setValue("")
  }

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-[360px_1fr] lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendario financeiro</CardTitle>
          <CardDescription>
            Dias em verde tem receitas, vermelho tem despesas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={selectedDate}
            markers={markers}
          />
          <div className="rounded-xl border p-3">
            <p className="text-sm font-medium">
              Lancamentos de {selectedDate.toLocaleDateString("pt-BR")}
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

      <Card>
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
                    className="h-9 rounded-md border bg-background px-3 text-sm"
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
                    className="h-9 rounded-md border bg-background px-3 text-sm"
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
                    type="date"
                    value={selectedDateKey}
                    onChange={(event) => setSelectedDate(new Date(`${event.target.value}T00:00:00`))}
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
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
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
                    className="h-9 rounded-md border bg-background px-3 text-sm"
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
    </div>
  )
}
