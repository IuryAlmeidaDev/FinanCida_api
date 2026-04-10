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
  showCategoryManager = true,
}: {
  dataset: FinanceDataset
  onDatasetChange: (dataset: FinanceDataset) => void
  onDatasetSave?: (dataset: FinanceDataset) => void | Promise<void>
  onMovementCreate?: (movement: MovementInput) => void | Promise<void>
  showCalendar?: boolean
  showForm?: boolean
  showCategoryManager?: boolean
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
        <div
          className={
            showCategoryManager
              ? "grid gap-4 xl:grid-cols-[minmax(280px,0.78fr)_minmax(440px,1.22fr)] xl:items-start"
              : "grid gap-4"
          }
        >
          {showCategoryManager ? (
          <Card className="overflow-hidden border-emerald-100 bg-linear-to-br from-white via-emerald-50/40 to-teal-50/60 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60 dark:from-card dark:via-card dark:to-card xl:sticky xl:top-6">
            <CardHeader className="border-b border-emerald-100/80 pb-4 dark:border-emerald-900/60">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-emerald-700 uppercase dark:text-emerald-300">
                    Identidade visual
                  </p>
                  <CardTitle className="text-lg">Categorias personalizadas</CardTitle>
                  <CardDescription className="max-w-sm text-xs leading-5">
                    Ajuste cor e icone sem deixar a tela pesada.
                  </CardDescription>
                </div>
                <div className="rounded-2xl border border-emerald-200/80 bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur dark:border-emerald-900/60 dark:bg-emerald-950/20">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Ativas
                  </p>
                  <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                    {categoryDrafts.length}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="rounded-3xl border border-white/70 bg-white/85 p-3 shadow-sm backdrop-blur dark:border-emerald-900/60 dark:bg-card">
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_76px_130px]">
                  <Input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="Nova categoria"
                    className="h-9 rounded-xl bg-background/70"
                  />
                  <Input
                    type="color"
                    value={newCategoryColor}
                    onChange={(event) => setNewCategoryColor(event.target.value)}
                    className="h-9 rounded-xl p-1"
                  />
                  <select
                    className="h-9 rounded-xl border border-input bg-background/70 px-3 text-sm"
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
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <CategoryIcon
                      category={newCategoryName.trim() || "Outros"}
                      definition={{
                        name: newCategoryName.trim() || "Outros",
                        color: newCategoryColor,
                        icon: newCategoryIcon,
                      }}
                      color={newCategoryColor}
                      withBadge
                    />
                    <span className="truncate">
                      {newCategoryName.trim() || "Preview da categoria"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl px-3"
                    onClick={() => void handleCreateCategory()}
                  >
                    <PlusIcon className="size-4" />
                    Criar
                  </Button>
                </div>
              </div>
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {categoryDrafts.map((item, index) => (
                  <div
                    key={item.name}
                    className="grid gap-2 rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/60 dark:bg-card/90 md:grid-cols-[minmax(0,1fr)_76px_130px]"
                  >
                    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-muted/40 px-2.5 py-2">
                      <CategoryIcon
                        category={item.name}
                        definition={item}
                        color={item.color}
                        withBadge
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {categoryIconOptions.find((option) => option.value === item.icon)?.label ?? item.icon}
                        </p>
                      </div>
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
                      className="h-9 rounded-xl p-1"
                    />
                    <select
                      className="h-9 rounded-xl border border-input bg-background/80 px-3 text-sm"
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
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-emerald-200/80 bg-white/70 px-3 py-2.5 dark:border-emerald-900/60 dark:bg-card/80">
                <p className="text-xs text-muted-foreground">
                  Mudancas visuais ficam salvas para toda a tela de lancamentos.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void handleSaveCategories()}>
                  Salvar categorias
                </Button>
              </div>
            </CardContent>
          </Card>
          ) : null}

          <Card
            className={
              showCategoryManager
                ? "overflow-hidden border-emerald-100 bg-linear-to-br from-white via-white to-emerald-50/40 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60 dark:from-card dark:via-card dark:to-card"
                : "overflow-hidden border-emerald-100 bg-linear-to-br from-white via-white to-emerald-50/40 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60 dark:from-card dark:via-card dark:to-card xl:max-w-4xl"
            }
          >
            <CardHeader className="border-b border-emerald-100/80 pb-4 dark:border-emerald-900/60">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-emerald-700 uppercase dark:text-emerald-300">
                    Novo lancamento
                  </p>
                  <CardTitle className="text-lg">Adicionar movimentacao</CardTitle>
                  <CardDescription className="max-w-md text-xs leading-5">
                    Registre entradas e saidas com um fluxo rapido, claro e sem poluir a tela.
                  </CardDescription>
                </div>
                <div className="rounded-2xl border border-emerald-200/80 bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur dark:border-emerald-900/60 dark:bg-emerald-950/20">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Data
                  </p>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    {formatBrazilianDate(selectedDate)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/85 px-3 py-2.5 shadow-sm dark:border-emerald-900/60 dark:bg-card/90">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Tipo
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {movementType === "expense" ? "Despesa" : "Receita"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/85 px-3 py-2.5 shadow-sm dark:border-emerald-900/60 dark:bg-card/90">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Recorrencia
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {recurrenceType === "unique" ? "Unica" : "Recorrente"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/85 px-3 py-2.5 shadow-sm dark:border-emerald-900/60 dark:bg-card/90">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Categoria
                  </p>
                  <div className="mt-1">
                    <CategoryBadge category={category} categories={dataset.categories} />
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <FieldGroup className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-emerald-900/60 dark:bg-card/90">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="movement-type">Tipo</FieldLabel>
                      <select
                        id="movement-type"
                        className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground"
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
                        className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground"
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
                      className="h-10 rounded-xl bg-background/80"
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
                        className="h-10 w-full justify-between rounded-xl bg-background/80"
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
                        className="h-10 rounded-xl bg-background/80"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="category">Categoria</FieldLabel>
                      <select
                        id="category"
                        className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground"
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
                    <div className="rounded-2xl border border-emerald-200/70 bg-linear-to-r from-emerald-50 via-white to-teal-50/80 p-3 dark:border-emerald-900/60 dark:from-emerald-950/20 dark:via-card dark:to-card">
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
                        className="h-10 rounded-xl border border-input bg-background/80 px-3 text-sm text-foreground"
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
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-emerald-200/80 bg-white/70 px-3 py-2.5 dark:border-emerald-900/60 dark:bg-card/80">
                    <p className="text-xs text-muted-foreground">
                      Lancamentos entram no dashboard logo apos salvar.
                    </p>
                    <Button type="submit" className="rounded-xl px-4">
                      Adicionar movimentacao
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
