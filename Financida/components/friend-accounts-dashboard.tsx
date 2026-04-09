"use client"

import * as React from "react"
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  LandmarkIcon,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useSharedTransactions } from "@/hooks/use-shared-transactions"
import { expenseCategories } from "@/lib/finance-movements"
import {
  formatBrazilianDate,
  formatIsoDateToBrazilian,
  moneyFormatter,
  parseCurrencyInput,
} from "@/lib/formatters"

type ScheduleType = "unique" | "installment" | "recurring"

const scheduleOptions: Array<{
  value: ScheduleType
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    value: "unique",
    title: "Única",
    description: "Pagamento em uma só data.",
    icon: CheckCircle2Icon,
  },
  {
    value: "installment",
    title: "Parcelada",
    description: "Você escolhe cada vencimento.",
    icon: Layers3Icon,
  },
  {
    value: "recurring",
    title: "Recorrente",
    description: "Repete mensalmente a partir da primeira data.",
    icon: Repeat2Icon,
  },
]

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
  if (type === "unique") {
    return "Cobrança única"
  }

  if (type === "recurring") {
    return `${installments} recorrências mensais`
  }

  return `${installments} parcelas`
}

export function FriendAccountsDashboard() {
  const {
    accounts,
    friends,
    createSharedTransaction,
    decideSharedTransaction,
  } = useSharedTransactions()
  const [friendUserId, setFriendUserId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] =
    React.useState<(typeof expenseCategories)[number]>("Outros")
  const [note, setNote] = React.useState("")
  const [totalAmount, setTotalAmount] = React.useState("0,00")
  const [scheduleType, setScheduleType] = React.useState<ScheduleType>("installment")
  const [installments, setInstallments] = React.useState(2)
  const [selectedSingleDate, setSelectedSingleDate] = React.useState<Date>(new Date())
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = React.useState("0")
  const [paymentDates, setPaymentDates] = React.useState<string[]>(["", ""])

  const incomingPendingAccounts = accounts.filter(
    (account) => account.role === "recipient" && account.status === "Pendente"
  )
  const historyAccounts = accounts.filter(
    (account) => account.role === "requester" || account.status === "Aceita"
  )

  React.useEffect(() => {
    if (scheduleType !== "installment") {
      return
    }

    setPaymentDates((currentDates) =>
      Array.from({ length: installments }, (_, index) => currentDates[index] ?? "")
    )
  }, [installments, scheduleType])

  React.useEffect(() => {
    if (scheduleType === "unique") {
      setInstallments(1)
      setPaymentDates([toDateKey(selectedSingleDate)])
      setSelectedInstallmentIndex("0")
      return
    }

    if (scheduleType === "recurring") {
      const recurringInstallments = Math.max(installments, 2)
      if (recurringInstallments !== installments) {
        setInstallments(recurringInstallments)
        return
      }

      setPaymentDates(buildRecurringDates(selectedSingleDate, recurringInstallments))
      setSelectedInstallmentIndex("0")
    }
  }, [installments, scheduleType, selectedSingleDate])

  const selectedInstallmentDate =
    paymentDates[Number(selectedInstallmentIndex)] &&
    scheduleType === "installment"
      ? fromDateKey(paymentDates[Number(selectedInstallmentIndex)])
      : selectedSingleDate

  const schedulePreviewDates = React.useMemo(() => {
    if (scheduleType === "installment") {
      return sortDateKeys(paymentDates.filter(Boolean))
    }

    return paymentDates
  }, [paymentDates, scheduleType])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!friendUserId || !description.trim() || parseCurrencyInput(totalAmount) <= 0) {
      toast.error("Preencha o amigo, a descrição e o valor para continuar.")
      return
    }

    const normalizedPaymentDates =
      scheduleType === "installment"
        ? paymentDates.filter(Boolean)
        : paymentDates

    const requiredInstallments =
      scheduleType === "unique" ? 1 : installments

    if (normalizedPaymentDates.length !== requiredInstallments) {
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
        installments: requiredInstallments,
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
      setSelectedInstallmentIndex("0")
      setPaymentDates(["", ""])
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar a conta."
      )
    }
  }

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:px-6">
      <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-slate-50 shadow-sm dark:border-emerald-900/60 dark:from-card dark:via-card dark:to-card">
        <CardHeader className="border-b border-emerald-100/80 bg-white/70 backdrop-blur-sm dark:border-emerald-900/60 dark:bg-card/80">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <SparklesIcon className="size-3.5" />
                Fluxo refinado
              </div>
              <CardTitle>Criar conta compartilhada</CardTitle>
              <CardDescription>
                Defina o amigo, o tipo de cobrança, a categoria e as datas com
                uma experiência mais guiada e elegante.
              </CardDescription>
            </div>
            <div className="hidden rounded-3xl border border-emerald-100 bg-white/90 p-4 text-right shadow-sm lg:block dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Total informado
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-200">
                {moneyFormatter.format(
                  parseCurrencyInput(totalAmount)
                )}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <form className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
            <div className="space-y-6 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Com quem você vai dividir?
                  </label>
                  <Select value={friendUserId} onValueChange={setFriendUserId}>
                    <SelectTrigger className="h-12 w-full rounded-2xl border-emerald-200 bg-white/90 px-4 text-left shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <UserRoundIcon className="size-4" />
                        </span>
                        <SelectValue placeholder="Selecione um amigo" />
                      </div>
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
                  <label className="text-sm font-medium text-foreground">
                    Categoria
                  </label>
                  <Select value={category} onValueChange={(value) => setCategory(value as (typeof expenseCategories)[number])}>
                    <SelectTrigger className="h-12 w-full rounded-2xl border-emerald-200 bg-white/90 px-4 shadow-sm">
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
                <label className="text-sm font-medium text-foreground">
                  Descrição
                </label>
                <Input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex.: Dívida de R$ 500,00 do jantar"
                  className="h-12 rounded-2xl border-emerald-200 bg-white/90 px-4 shadow-sm"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Valor total
                  </label>
                  <CurrencyInput
                    value={totalAmount}
                    onValueChange={(maskedValue) => setTotalAmount(maskedValue)}
                    placeholder="0,00"
                    className="h-12 rounded-2xl border-emerald-200 bg-white/90 px-4 text-right text-lg font-semibold tabular-nums shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Quantidade
                  </label>
                  <Input
                    type="number"
                    min={scheduleType === "unique" ? 1 : 2}
                    max={120}
                    value={scheduleType === "unique" ? 1 : installments}
                    disabled={scheduleType === "unique"}
                    onChange={(event) =>
                      setInstallments(Math.max(Number(event.target.value) || 1, scheduleType === "unique" ? 1 : 2))
                    }
                    className="h-12 rounded-2xl border-emerald-200 bg-white/90 px-4 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LandmarkIcon className="size-4 text-emerald-700" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Como essa cobrança vai acontecer?
                  </h3>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {scheduleOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = scheduleType === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setScheduleType(option.value)}
                        className={[
                          "rounded-[24px] border p-4 text-left transition-all",
                          isActive
                            ? "border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100"
                            : "border-emerald-100 bg-white/90 hover:border-emerald-200 hover:bg-emerald-50/60",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={[
                              "inline-flex size-10 items-center justify-center rounded-2xl",
                              isActive
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-100 text-emerald-700",
                            ].join(" ")}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div>
                            <p className="font-semibold">{option.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Observação final
                </label>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Adicione contexto, combine vencimentos ou registre qualquer detalhe importante."
                  className="rounded-2xl border-emerald-200 bg-white/90 shadow-sm"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Resumo da cobrança
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {getScheduleLabel(scheduleType, scheduleType === "unique" ? 1 : installments)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Valor por parcela
                  </p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-200">
                    {moneyFormatter.format(
                      parseCurrencyInput(totalAmount) /
                        (scheduleType === "unique" ? 1 : installments)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="h-11 rounded-2xl px-6">
                  Salvar conta compartilhada
                </Button>
              </div>
            </div>

            <div className="border-t border-emerald-100 bg-white/70 p-6 backdrop-blur-sm lg:border-t-0 lg:border-l dark:border-emerald-900/60 dark:bg-card/70">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Agenda de cobrança
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    Selecione as datas com um clique
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {scheduleType === "installment"
                      ? "Escolha o vencimento de cada parcela no calendário."
                      : "Defina a data inicial e o app prepara o restante para você."}
                  </p>
                </div>

                {scheduleType === "installment" ? (
                  <div className="space-y-3">
                    <ToggleGroup
                      type="single"
                      value={selectedInstallmentIndex}
                      onValueChange={(value) => {
                        if (value) {
                          setSelectedInstallmentIndex(value)
                        }
                      }}
                      variant="outline"
                      className="grid w-full grid-cols-2 gap-2 md:grid-cols-3"
                    >
                      {Array.from({ length: installments }, (_, index) => (
                        <ToggleGroupItem
                          key={index}
                          value={String(index)}
                          className="h-auto rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-left data-[state=on]:border-emerald-400 data-[state=on]:bg-emerald-50"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Parcela {index + 1}
                            </span>
                            <span className="mt-1 text-sm font-semibold">
                              {paymentDates[index]
                                ? formatIsoDateToBrazilian(paymentDates[index])
                                : "Selecionar data"}
                            </span>
                          </div>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm dark:border-emerald-900/60 dark:from-emerald-950/20 dark:to-card">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {scheduleType === "unique" ? "Data escolhida" : "Primeira cobrança"}
                        </p>
                        <p className="mt-1 text-base font-semibold">
                          {formatBrazilianDate(selectedSingleDate)}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm text-emerald-700">
                        <CalendarDaysIcon className="size-4" />
                        {getScheduleLabel(scheduleType, scheduleType === "unique" ? 1 : installments)}
                      </div>
                    </div>
                  </div>
                )}

                <Calendar
                  selected={selectedInstallmentDate}
                  month={selectedInstallmentDate}
                  onSelect={(date) => {
                    if (scheduleType === "installment") {
                      const installmentIndex = Number(selectedInstallmentIndex)

                      setPaymentDates((currentDates) =>
                        currentDates.map((currentDate, index) =>
                          index === installmentIndex ? toDateKey(date) : currentDate
                        )
                      )
                      return
                    }

                    setSelectedSingleDate(date)
                  }}
                />

                <div className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm dark:border-emerald-900/60 dark:bg-card">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Prévia do cronograma</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {schedulePreviewDates.length} data(s)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {schedulePreviewDates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        As datas escolhidas aparecerão aqui.
                      </p>
                    ) : (
                      schedulePreviewDates.map((date, index) => (
                        <div
                          key={`${date}-${index}`}
                          className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {scheduleType === "unique"
                                ? "Pagamento"
                                : scheduleType === "recurring"
                                  ? `Recorrência ${index + 1}`
                                  : `Parcela ${index + 1}`}
                            </p>
                            <p className="text-muted-foreground">
                              {formatIsoDateToBrazilian(date)}
                            </p>
                          </div>
                          <span className="font-semibold text-emerald-700">
                            {moneyFormatter.format(
                              parseCurrencyInput(totalAmount) /
                                (scheduleType === "unique" ? 1 : installments)
                            )}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="border-emerald-100 dark:border-emerald-900/60">
          <CardHeader>
            <CardTitle>Solicitações recebidas</CardTitle>
            <CardDescription>
              Aceite aqui as contas compartilhadas enviadas por amigos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {incomingPendingAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma solicitação pendente no momento.
              </p>
            ) : (
              incomingPendingAccounts.map((account) => (
                <div
                  key={account.id}
                  className="grid gap-4 rounded-[24px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-4 shadow-sm"
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
                      <span className="rounded-full border border-emerald-200 bg-white px-3 py-1">
                        {getScheduleLabel(account.recurrenceType, account.installments)}
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-white px-3 py-1">
                        {moneyFormatter.format(account.installmentValue)} por ciclo
                      </span>
                    </div>
                    {account.note ? (
                      <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3 text-sm text-muted-foreground">
                        <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                          <MessageSquareTextIcon className="size-4 text-emerald-700" />
                          Observação
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

        <Card className="border-emerald-100 dark:border-emerald-900/60">
          <CardHeader>
            <CardTitle>Histórico de contas</CardTitle>
            <CardDescription>
              Contas criadas por você e contas aceitas entre amigos.
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
                  className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm"
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
                    {account.role === "requester"
                      ? "Criada por você"
                      : "Recebida por você"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
