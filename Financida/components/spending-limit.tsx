"use client"

import * as React from "react"
import { LoaderCircleIcon, SaveIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CurrencyInput } from "@/components/currency-input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FinancialSummary } from "@/lib/finance"
import { formatCurrencyInput, moneyFormatter } from "@/lib/formatters"

function getLimitStatus(percentage: number) {
  if (percentage >= 100) {
    return {
      label: "Limite estourado",
      className: "border-red-200 bg-red-50 text-red-700",
    }
  }

  if (percentage >= 80) {
    return {
      label: "Atencao",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    }
  }

  return {
    label: "Saudavel",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }
}

function roundUpToStep(value: number, step: number) {
  return Math.ceil(value / step) * step
}

export function SpendingLimit({ summary }: { summary: FinancialSummary }) {
  const automaticMonthlyBase = Math.max(Math.round(summary.totalRevenue), 1000)
  const [monthlyLimit, setMonthlyLimit] = React.useState(automaticMonthlyBase)
  const [monthlyLimitInput, setMonthlyLimitInput] = React.useState(
    formatCurrencyInput(automaticMonthlyBase)
  )
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const sliderMax = roundUpToStep(
    Math.max(
      automaticMonthlyBase * 2,
      monthlyLimit * 1.35,
      summary.totalExpenses * 1.5,
      10000
    ),
    500
  )
  const percentage = monthlyLimit > 0
    ? Math.min((summary.totalExpenses / monthlyLimit) * 100, 100)
    : 0
  const remainingAmount = monthlyLimit - summary.totalExpenses
  const limitStatus = getLimitStatus(percentage)

  React.useEffect(() => {
    let ignore = false

    async function loadSpendingLimit() {
      const response = await fetch("/api/spending-limit", { cache: "no-store" })

      if (!response.ok) {
        if (!ignore) {
          setMonthlyLimit(automaticMonthlyBase)
          setMonthlyLimitInput(formatCurrencyInput(automaticMonthlyBase))
          setIsLoading(false)
        }
        return
      }

      const payload = (await response.json()) as { monthlyLimit: number }

      if (!ignore) {
        setMonthlyLimit(payload.monthlyLimit)
        setMonthlyLimitInput(formatCurrencyInput(payload.monthlyLimit))
        setIsLoading(false)
      }
    }

    void loadSpendingLimit()

    return () => {
      ignore = true
    }
  }, [automaticMonthlyBase])

  async function saveSpendingLimit() {
    setIsSaving(true)

    const response = await fetch("/api/spending-limit", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ monthlyLimit }),
    })

    setIsSaving(false)

    if (!response.ok) {
      toast.error("Nao foi possivel salvar o limite de gastos")
      return
    }

    toast.success("Limite de gastos salvo com sucesso")
  }

  function applyMonthlyLimit(nextLimit: number) {
    const normalizedLimit = Math.max(Math.round(nextLimit), 1000)
    setMonthlyLimit(normalizedLimit)
    setMonthlyLimitInput(formatCurrencyInput(normalizedLimit))
  }

  return (
    <div className="px-4 lg:px-6">
      <Card className="border-emerald-100">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Limite de gastos</CardTitle>
              <CardDescription>
                O sistema usa sua receita atual do mes como base e voce ainda pode ajustar manualmente ou pela barra
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  Carregando
                </Badge>
              ) : null}
              <Badge variant="outline" className={limitStatus.className}>
                {limitStatus.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Limite mensal definido</p>
                  <p className="text-3xl font-semibold tabular-nums">
                    {moneyFormatter.format(monthlyLimit)}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white/90 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <SparklesIcon className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Base automatica
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-semibold">
                    {moneyFormatter.format(automaticMonthlyBase)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receita atual do mes
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-emerald-600"
                  type="range"
                  min={1000}
                  max={sliderMax}
                  step={100}
                  value={Math.min(monthlyLimit, sliderMax)}
                  disabled={isLoading || isSaving}
                  onChange={(event) => applyMonthlyLimit(Number(event.target.value))}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{moneyFormatter.format(1000)}</span>
                  <span>{moneyFormatter.format(sliderMax)}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>{percentage.toFixed(1)}% usado</span>
                  <span>
                    {moneyFormatter.format(Math.max(remainingAmount, 0))} restante
                  </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-white ring-1 ring-emerald-100">
                  <div
                    className={
                      percentage >= 100
                        ? "h-full rounded-full bg-gradient-to-r from-red-500 to-red-700"
                        : percentage >= 80
                          ? "h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600"
                          : "h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                    }
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-emerald-100 p-4">
                <p className="text-sm font-medium text-muted-foreground">Receita do mes</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {moneyFormatter.format(summary.totalRevenue)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 p-4">
                <p className="text-sm font-medium text-muted-foreground">Gasto atual</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {moneyFormatter.format(summary.totalExpenses)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 p-4">
                <p className="text-sm font-medium text-muted-foreground">Saldo disponivel</p>
                <p
                  className={
                    remainingAmount >= 0
                      ? "mt-2 text-2xl font-semibold tabular-nums text-emerald-700"
                      : "mt-2 text-2xl font-semibold tabular-nums text-red-700"
                  }
                >
                  {moneyFormatter.format(remainingAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 p-4">
                <p className="text-sm font-medium text-muted-foreground">Ajuste manual</p>
                <CurrencyInput
                  className="mt-2 text-right tabular-nums"
                  value={monthlyLimitInput}
                  disabled={isLoading || isSaving}
                  onValueChange={(maskedValue, numericValue) => {
                    setMonthlyLimitInput(maskedValue)
                    setMonthlyLimit(Math.max(Math.round(numericValue), 1000))
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  disabled={isLoading || isSaving}
                  onClick={() => applyMonthlyLimit(automaticMonthlyBase)}
                >
                  Usar receita do mes
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isLoading || isSaving}
              onClick={() => void saveSpendingLimit()}
            >
              {isSaving ? (
                <>
                  <LoaderCircleIcon className="animate-spin" />
                  Salvando
                </>
              ) : (
                <>
                  <SaveIcon />
                  Salvar limite
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
