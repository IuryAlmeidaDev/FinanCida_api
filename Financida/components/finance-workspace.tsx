"use client"

import * as React from "react"
import { CalendarDaysIcon, PlusIcon } from "lucide-react"

import { CategoryBadge } from "@/components/category-badge"
import { CurrencyInput } from "@/components/currency-input"
import {
  categoryIconOptions,
  CategoryIcon,
} from "@/components/category-icon"
import { Button } from "@/components/ui/button"
import { Calendar, type CalendarMarker } from "@/components/ui/calendar"
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
  CategoryDefinition,
  CategoryIconName,
  ExpenseCategory,
  FinanceDataset,
  FixedExpenseStatus,
} from "@/lib/finance"
import { getCategoryDefinition } from "@/lib/finance"
import {
  addMovementToDataset,
  type MovementInput,
} from "@/lib/finance-movements"
import {
  formatBrazilianDate,
  moneyFormatter,
  parseCurrencyInput,
} from "@/lib/formatters"

type MovementType = "expense" | "revenue"
type RecurrenceType = "unique" | "recurring"

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function FinanceWorkspace({
  dataset,
  onDatasetChange,
  onDatasetSave,
  onMovementCreate,
  showCalendar = true,
  showForm = true,
}: {
  dataset: FinanceDataset
  onDatasetChange: (dataset: FinanceDataset) => void
  onDatasetSave?: (dataset: FinanceDataset) => void | Promise<void>
  onMovementCreate?: (movement: MovementInput) => void | Promise<void>
  showCalendar?: boolean
  showForm?: boolean
}) {
  const currentDate = React.useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = React.useState(currentDate)
  const [movementType, setMovementType] = React.useState<MovementType>("expense")
  const [recurrenceType, setRecurrenceType] = React.useState<RecurrenceType>("unique")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<ExpenseCategory>(
    dataset.categories[0]?.name ?? "Moradia"
  )
  const [value, setValue] = React.useState("")
  const [status, setStatus] = React.useState<FixedExpenseStatus>("Pendente")
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)
  const [categoryDrafts, setCategoryDrafts] = React.useState<CategoryDefinition[]>(
    dataset.categories
  )
  const [newCategoryName, setNewCategoryName] = React.useState("")
  const [newCategoryColor, setNewCategoryColor] = React.useState("#14b8a6")
  const [newCategoryIcon, setNewCategoryIcon] =
    React.useState<CategoryIconName>("wallet")

  React.useEffect(() => {
    setCategoryDrafts(dataset.categories)
  }, [dataset.categories])

  React.useEffect(() => {
    if (!dataset.categories.some((item) => item.name === category)) {
      setCategory(dataset.categories[0]?.name ?? "Moradia")
    }
  }, [category, dataset.categories])

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
        label: "Despesa variavel",
        description: expense.description,
        category: expense.category,
        value: expense.value,
      }))

    return [...revenues, ...fixed, ...variable]
  }, [dataset, selectedDateKey])

  async function persistDataset(nextDataset: FinanceDataset) {
    onDatasetChange(nextDataset)
    await onDatasetSave?.(nextDataset)
  }

  async function handleSaveCategories() {
    await persistDataset({
      ...dataset,
      categories: categoryDrafts,
    })
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim()

    if (!name) {
      return
    }

    if (categoryDrafts.some((item) => item.name === name)) {
      setCategory(name)
      return
    }

    const nextCategories = [
      ...categoryDrafts,
      {
        name,
        color: newCategoryColor,
        icon: newCategoryIcon,
      },
    ]

    await persistDataset({
      ...dataset,
      categories: nextCategories,
    })
    setCategoryDrafts(nextCategories)
    setCategory(name)
    setNewCategoryName("")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedValue = parseCurrencyInput(value)

    if (!description.trim() || Number.isNaN(parsedValue) || parsedValue <= 0) {
      return
    }

    const movementDateKey = toDateKey(selectedDate)
    const categoryDefinition =
      movementType === "expense"
        ? getCategoryDefinition(dataset, category)
        : undefined
    const movement: MovementInput = {
      type: movementType,
      recurrence: recurrenceType,
      date: movementDateKey,
      description,
      category,
      value: parsedValue,
      status,
      categoryDefinition,
    }

    if (onMovementCreate) {
      await onMovementCreate(movement)
    } else {
      await persistDataset(addMovementToDataset(dataset, movement))
    }

    setDescription("")
    setValue("")
    setStatus("Pendente")
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
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="text-xs text-muted-foreground">{movement.label}</p>
                          <CategoryBadge
                            category={movement.category}
                            categories={dataset.categories}
                          />
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
        <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)] xl:items-start">
          <Card className="border-emerald-100 dark:border-emerald-900/60 xl:sticky xl:top-6">
            <CardHeader>
              <CardTitle>Categorias personalizadas</CardTitle>
              <CardDescription>
                Ajuste cor e icone de cada categoria ou crie uma nova para seus lancamentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_88px_140px_auto]">
                <Input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Nova categoria"
                />
                <Input
                  type="color"
                  value={newCategoryColor}
                  onChange={(event) => setNewCategoryColor(event.target.value)}
                  className="h-10"
                />
                <select
                  className="h-10 rounded-md border border-input bg-card px-3 text-sm"
                  value={newCategoryIcon}
                  onChange={(event) =>
                    setNewCategoryIcon(event.target.value as CategoryIconName)
                  }
                >
                  {categoryIconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={() => void handleCreateCategory()}>
                  <PlusIcon className="size-4" />
                  Criar
                </Button>
              </div>
              <div className="space-y-3">
                {categoryDrafts.map((item, index) => (
                  <div
                    key={item.name}
                    className="grid gap-3 rounded-2xl border border-border/60 p-3 md:grid-cols-[minmax(0,1fr)_88px_140px]"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryBadge category={item.name} categories={categoryDrafts} />
                    </div>
                    <Input
                      type="color"
                      value={item.color}
                      onChange={(event) =>
                        setCategoryDrafts((current) =>
                          current.map((categoryItem, currentIndex) =>
                            currentIndex === index
                              ? { ...categoryItem, color: event.target.value }
                              : categoryItem
                          )
                        )
                      }
                      className="h-10"
                    />
                    <select
                      className="h-10 rounded-md border border-input bg-card px-3 text-sm"
                      value={item.icon}
                      onChange={(event) =>
                        setCategoryDrafts((current) =>
                          current.map((categoryItem, currentIndex) =>
                            currentIndex === index
                              ? {
                                  ...categoryItem,
                                  icon: event.target.value as CategoryIconName,
                                }
                              : categoryItem
                          )
                        )
                      }
                    >
                      {categoryIconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={() => void handleSaveCategories()}>
                  Salvar categorias
                </Button>
              </div>
            </CardContent>
          </Card>

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
                        onChange={(event) =>
                          setMovementType(event.target.value as MovementType)
                        }
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
                        onChange={(event) =>
                          setRecurrenceType(event.target.value as RecurrenceType)
                        }
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
                    <Field className="relative">
                      <FieldLabel htmlFor="date-trigger">Data</FieldLabel>
                      <Button
                        id="date-trigger"
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setDatePickerOpen((current) => !current)}
                      >
                        {formatBrazilianDate(selectedDate)}
                        <CalendarDaysIcon className="size-4" />
                      </Button>
                      {datePickerOpen ? (
                        <div className="absolute z-20 mt-2">
                          <Calendar
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date)
                              setDatePickerOpen(false)
                            }}
                            month={selectedDate}
                            className="w-[320px] p-3"
                          />
                        </div>
                      ) : null}
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
                      <select
                        id="category"
                        className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        disabled={movementType === "revenue"}
                      >
                        {dataset.categories.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  {movementType === "expense" ? (
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <CategoryIcon
                          category={category}
                          definition={getCategoryDefinition(dataset, category)}
                          color={getCategoryDefinition(dataset, category).color}
                          withBadge
                        />
                        <span className="font-medium">Categoria selecionada</span>
                        <CategoryBadge category={category} categories={dataset.categories} />
                      </div>
                    </div>
                  ) : null}
                  {movementType === "expense" && recurrenceType === "recurring" && (
                    <Field>
                      <FieldLabel htmlFor="status">Status da despesa fixa</FieldLabel>
                      <select
                        id="status"
                        className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                        value={status}
                        onChange={(event) =>
                          setStatus(event.target.value as FixedExpenseStatus)
                        }
                      >
                        <option>Pendente</option>
                        <option>Pago</option>
                        <option>Atrasado</option>
                      </select>
                      <FieldDescription>
                        Se nao estiver paga, a despesa fica como pendente ate voce marcar como paga.
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
      )}
    </div>
  )
}
