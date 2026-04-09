"use client"

import * as React from "react"
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  Layers3Icon,
  MessageSquareTextIcon,
  Repeat2Icon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react"
import { toast } from "sonner"

import { CategoryBadge } from "@/components/category-badge"
import { CurrencyInput } from "@/components/currency-input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSharedTransactions } from "@/hooks/use-shared-transactions"
import { expenseCategories } from "@/lib/finance-movements"
import {
  formatBrazilianDate,
  formatIsoDateToBrazilian,
  moneyFormatter,
  parseCurrencyInput,
} from "@/lib/formatters"
import { cn } from "@/lib/utils"

type ScheduleType = "unique" | "installment" | "recurring"

const scheduleOptions = [
  {
    value: "unique" as const,
    title: "Unica",
    description: "Uma data, um unico repasse.",
    icon: CheckCircle2Icon,
  },
  {
    value: "installment" as const,
    title: "Parcelada",
    description: "Cada parcela com seu proprio vencimento.",
    icon: Layers3Icon,
  },
  {
    value: "recurring" as const,
    title: "Recorrente",
    description: "Repete mensalmente a partir da primeira data.",
    icon: Repeat2Icon,
  },
]

const cardClass =
  "border-emerald-100/90 bg-white/95 shadow-[0_18px_60px_-32px_rgba(5,150,105,0.35)] dark:border-emerald-900/60 dark:bg-card/95"
const panelClass =
  "rounded-[28px] border border-emerald-100/90 bg-white/88 p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-emerald-900/60 dark:bg-card/70"
const fieldClass =
  "h-12 rounded-2xl border-emerald-100 bg-white px-4 shadow-none focus-visible:border-emerald-400 focus-visible:ring-4 focus-visible:ring-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:focus-visible:ring-emerald-900/40"

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function fromDateKey(value: string) {
  return new Date(`${value}T00:00:00`)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate())
}

function buildRecurringDates(firstDate: Date, installments: number) {
  return Array.from({ length: installments }, (_, index) =>
    toDateKey(addMonths(firstDate, index))
  )
}

function sortDateKeys(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right))
}

function getScheduleLabel(type: ScheduleType, installments: number) {
  if (type === "unique") return "Cobranca unica"
  if (type === "recurring") return `${installments} recorrencias mensais`
  return `${installments} parcelas`
}

export function FriendAccountsDashboard() {
  const { accounts, friends, createSharedTransaction, decideSharedTransaction } =
    useSharedTransactions()
  const [friendUserId, setFriendUserId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] =
    React.useState<(typeof expenseCategories)[number]>("Outros")
  const [note, setNote] = React.useState("")
  const [totalAmount, setTotalAmount] = React.useState("0,00")
  const [scheduleType, setScheduleType] =
    React.useState<ScheduleType>("installment")
  const [installments, setInstallments] = React.useState(2)
  const [selectedSingleDate, setSelectedSingleDate] = React.useState(new Date())
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = React.useState(0)
  const [paymentDates, setPaymentDates] = React.useState<string[]>(["", ""])

  const incomingPendingAccounts = accounts.filter(
    (account) => account.role === "recipient" && account.status === "Pendente"
  )
  const historyAccounts = accounts.filter(
    (account) => account.role === "requester" || account.status === "Aceita"
  )

  React.useEffect(() => {
    if (scheduleType !== "installment") return
    setPaymentDates((currentDates) =>
      Array.from({ length: installments }, (_, index) => currentDates[index] ?? "")
    )
  }, [installments, scheduleType])

  React.useEffect(() => {
    if (scheduleType === "unique") {
      setInstallments(1)
      setPaymentDates([toDateKey(selectedSingleDate)])
      setSelectedInstallmentIndex(0)
      return
    }

    if (scheduleType === "recurring") {
      const nextInstallments = Math.max(installments, 2)
      if (nextInstallments !== installments) {
        setInstallments(nextInstallments)
        return
      }
      setPaymentDates(buildRecurringDates(selectedSingleDate, nextInstallments))
      setSelectedInstallmentIndex(0)
    }
  }, [installments, scheduleType, selectedSingleDate])

  const installmentCount = scheduleType === "unique" ? 1 : installments
  const selectedInstallmentDate =
    scheduleType === "installment" && paymentDates[selectedInstallmentIndex]
      ? fromDateKey(paymentDates[selectedInstallmentIndex])
      : selectedSingleDate
  const schedulePreviewDates =
    scheduleType === "installment"
      ? sortDateKeys(paymentDates.filter(Boolean))
      : paymentDates
  const installmentAmount = parseCurrencyInput(totalAmount) / installmentCount

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!friendUserId || !description.trim() || parseCurrencyInput(totalAmount) <= 0) {
      toast.error("Preencha o amigo, a descricao e o valor para continuar.")
      return
    }

    const normalizedPaymentDates =
      scheduleType === "installment" ? paymentDates.filter(Boolean) : paymentDates

    if (normalizedPaymentDates.length !== installmentCount) {
      toast.error("Selecione todas as datas antes de salvar.")
      return
    }

    try {
      await createSharedTransaction({
        friendUserId,
        description,
        category,
        note,
        totalAmount: parseCurrencyInput(totalAmount),
        recurrenceType: scheduleType,
        installments: installmentCount,
        paymentDates:
          scheduleType === "installment"
            ? sortDateKeys(normalizedPaymentDates)
            : normalizedPaymentDates,
      })

      setFriendUserId("")
      setDescription("")
      setCategory("Outros")
      setNote("")
      setTotalAmount("0,00")
      setScheduleType("installment")
      setInstallments(2)
      setSelectedSingleDate(new Date())
      setSelectedInstallmentIndex(0)
      setPaymentDates(["", ""])
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nao foi possivel salvar a conta."
      )
    }
  }

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:px-6">
      <div className="grid gap-4">
        <Card className={cardClass}>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <SparklesIcon className="size-3.5" />
                  Contas compartilhadas
                </div>
                <CardTitle>Criar conta compartilhada</CardTitle>
                <CardDescription>
                  Um composer mais limpo, com pesos visuais consistentes e sem
                  bordas quebradas.
                </CardDescription>
              </div>
              <div className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-4 py-3 text-right dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-card">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Total informado
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-200">
                  {moneyFormatter.format(parseCurrencyInput(totalAmount))}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className={panelClass}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <UserRoundIcon className="size-4 text-emerald-700" />
                    Dados principais
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amigo</label>
                        <Select value={friendUserId} onValueChange={setFriendUserId}>
                          <SelectTrigger className={cn("w-full", fieldClass)}>
                            <SelectValue placeholder="Selecione um amigo" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="rounded-2xl">
                            {friends.map((friend) => (
                              <SelectItem key={friend.id} value={friend.id}>
                                <div className="flex flex-col">
                                  <span>{friend.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {friend.handle}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Categoria</label>
                        <Select
                          value={category}
                          onValueChange={(value) =>
                            setCategory(value as (typeof expenseCategories)[number])
                          }
                        >
                          <SelectTrigger className={cn("w-full", fieldClass)}>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="rounded-2xl">
                            {expenseCategories.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descricao</label>
                      <Input
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Ex.: divida do jantar, aluguel, viagem"
                        className={fieldClass}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Valor total</label>
                        <CurrencyInput
                          value={totalAmount}
                          onValueChange={(maskedValue) => setTotalAmount(maskedValue)}
                          placeholder="0,00"
                          className={cn(
                            fieldClass,
                            "text-right text-lg font-semibold tabular-nums"
                          )}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quantidade</label>
                        <Input
                          type="number"
                          min={scheduleType === "unique" ? 1 : 2}
                          max={120}
                          value={installmentCount}
                          disabled={scheduleType === "unique"}
                          onChange={(event) =>
                            setInstallments(
                              Math.max(
                                Number(event.target.value) || 1,
                                scheduleType === "unique" ? 1 : 2
                              )
                            )
                          }
                          className={fieldClass}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={panelClass}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <SparklesIcon className="size-4 text-emerald-700" />
                    Tipo de cobranca
                  </div>
                  <div className="grid gap-3">
                    {scheduleOptions.map((option) => {
                      const Icon = option.icon
                      const isActive = scheduleType === option.value

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setScheduleType(option.value)}
                          className={cn(
                            "flex items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition-all",
                            isActive
                              ? "border-emerald-300 bg-emerald-50 shadow-[0_10px_30px_-24px_rgba(5,150,105,0.65)]"
                              : "border-emerald-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
                              isActive
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div>
                            <p className="font-semibold">{option.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-4 rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Resumo da cobranca
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {getScheduleLabel(scheduleType, installmentCount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Valor por ciclo
                        </p>
                        <p className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-200">
                          {moneyFormatter.format(installmentAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
                <div className={panelClass}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <CalendarDaysIcon className="size-4 text-emerald-700" />
                    Agenda de cobranca
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {scheduleType === "installment"
                      ? "Selecione uma parcela e marque a data direto no calendario."
                      : "Escolha a primeira data e o restante do cronograma e calculado automaticamente."}
                  </p>
                  {scheduleType === "installment" ? (
                    <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: installments }, (_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedInstallmentIndex(index)}
                          className={cn(
                            "rounded-[22px] border px-4 py-3 text-left transition-all",
                            selectedInstallmentIndex === index
                              ? "border-emerald-300 bg-emerald-50 shadow-[0_10px_24px_-22px_rgba(5,150,105,0.7)]"
                              : "border-emerald-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                          )}
                        >
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Parcela {index + 1}
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {paymentDates[index]
                              ? formatIsoDateToBrazilian(paymentDates[index])
                              : "Selecionar data"}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4 rounded-[24px] border border-emerald-100 bg-white p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {scheduleType === "unique" ? "Data escolhida" : "Primeira data"}
                          </p>
                          <p className="mt-1 text-base font-semibold">
                            {formatBrazilianDate(selectedSingleDate)}
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                          {getScheduleLabel(scheduleType, installmentCount)}
                        </span>
                      </div>
                    </div>
                  )}
                  <Calendar
                    className="rounded-[30px] ring-0"
                    selected={selectedInstallmentDate}
                    month={selectedInstallmentDate}
                    onSelect={(date) => {
                      if (scheduleType === "installment") {
                        setPaymentDates((currentDates) =>
                          currentDates.map((currentDate, index) =>
                            index === selectedInstallmentIndex ? toDateKey(date) : currentDate
                          )
                        )
                        return
                      }
                      setSelectedSingleDate(date)
                    }}
                  />
                </div>
                <div className={panelClass}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <MessageSquareTextIcon className="size-4 text-emerald-700" />
                    Observacao e previa
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Observacao final</label>
                      <Textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Combine vencimentos, explique o contexto ou registre qualquer detalhe importante."
                        className="rounded-2xl border-emerald-100 bg-white shadow-none dark:border-emerald-900/60 dark:bg-emerald-950/20"
                      />
                    </div>
                    <div className="rounded-[24px] border border-emerald-100 bg-white p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Previa do cronograma</p>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {schedulePreviewDates.length} data(s)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {schedulePreviewDates.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            As datas escolhidas aparecerao aqui.
                          </p>
                        ) : (
                          schedulePreviewDates.map((date, index) => (
                            <div
                              key={`${date}-${index}`}
                              className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {scheduleType === "unique"
                                    ? "Pagamento"
                                    : scheduleType === "recurring"
                                      ? `Recorrencia ${index + 1}`
                                      : `Parcela ${index + 1}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatIsoDateToBrazilian(date)}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                                {moneyFormatter.format(installmentAmount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" className="h-11 rounded-2xl px-6">
                        Salvar conta compartilhada
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader>
            <CardTitle>Historico de contas</CardTitle>
            <CardDescription>
              Contas criadas por voce e contas aceitas entre amigos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {historyAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conta compartilhada cadastrada ainda.
              </p>
            ) : (
              historyAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.55)] dark:border-emerald-900/60 dark:bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="font-semibold">
                        {account.counterpartName} ({account.counterpartHandle})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                    </div>
                    <span
                      className={
                        account.status === "Aceita"
                          ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : account.status === "Recusada"
                            ? "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                            : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {account.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <CategoryBadge category={account.category} />
                    <span className="rounded-full border border-emerald-200 px-3 py-1 text-xs text-muted-foreground">
                      {getScheduleLabel(account.recurrenceType, account.installments)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm">
                    {account.installments} ciclo(s) de{" "}
                    {moneyFormatter.format(account.installmentValue)}
                  </p>
                  {account.note ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {account.note}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {account.role === "requester" ? "Criada por voce" : "Recebida por voce"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Solicitacoes recebidas</CardTitle>
          <CardDescription>
            Aceite aqui as contas compartilhadas enviadas por amigos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {incomingPendingAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma solicitacao pendente no momento.
            </p>
          ) : (
            incomingPendingAccounts.map((account) => (
              <div
                key={account.id}
                className="grid gap-4 rounded-[26px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-[0_14px_36px_-28px_rgba(5,150,105,0.45)] dark:border-emerald-900/60 dark:from-card dark:to-emerald-950/20"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {account.counterpartName} ({account.counterpartHandle})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                    </div>
                    <CategoryBadge category={account.category} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                      {getScheduleLabel(account.recurrenceType, account.installments)}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                      {moneyFormatter.format(account.installmentValue)} por ciclo
                    </span>
                  </div>
                  {account.note ? (
                    <div className="rounded-2xl border border-emerald-100 bg-white/85 p-3 text-sm text-muted-foreground dark:border-emerald-900/60 dark:bg-emerald-950/20">
                      <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                        <MessageSquareTextIcon className="size-4 text-emerald-700 dark:text-emerald-200" />
                        Observacao
                      </div>
                      {account.note}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() =>
                      void decideSharedTransaction({
                        accountId: account.id,
                        action: "accept",
                      })
                    }
                  >
                    Aceitar conta
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() =>
                      void decideSharedTransaction({
                        accountId: account.id,
                        action: "reject",
                      })
                    }
                  >
                    Recusar
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
