"use client"

import * as React from "react"
import { LoaderCircleIcon, SaveIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { FinancialSummary } from "@/lib/finance"

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const suggestedLimits = [3000, 6000, 10000, 15000]

function getLimitStatus(percentage: number) {
  if (percentage >= 100) {
    return {
      label: "Limite Estourado",
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

export function SpendingLimit({ summary }: { summary: FinancialSummary }) {
  const [monthlyLimit, setMonthlyLimit] = React.useState(6000)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const percentage = Math.min((summary.totalExpenses / monthlyLimit) * 100, 100)
  const remainingAmount = monthlyLimit - summary.totalExpenses
  const limitStatus = getLimitStatus(percentage)

  React.useEffect(() => {
    let ignore = false

    async function loadSpendingLimit() {
      const response = await fetch("/api/spending-limit", { cache: "no-store" })

      if (!response.ok) {
        if (!ignore) {
          setIsLoading(false)
        }
        return
      }

      const payload = (await response.json()) as { monthlyLimit: number }

      if (!ignore) {
        setMonthlyLimit(payload.monthlyLimit)
        setIsLoading(false)
      }
    }

    void loadSpendingLimit()

    return () => {
      ignore = true
    }
  }, [])

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
      toast.error("Nao foi possivel salvar o limite de gastos.")
      return
    }

    toast.success("Limite de gastos salvo com sucesso.")
  }

  return (
    <div className="px-4 lg:px-6">
      <Card className="border-emerald-100">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Limite de gastos</CardTitle>
              <CardDescription>
                Ajuste seu teto mensal com uma experiencia mais visual e acompanhe o uso em tempo real.
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
          <div className="grid gap-3 md:grid-cols-4">
            {suggestedLimits.map((limit) => (
              <Button
                key={limit}
                type="button"
                variant={monthlyLimit === limit ? "default" : "outline"}
                className={
                  monthlyLimit === limit
                    ? "justify-start bg-emerald-600 text-white hover:bg-emerald-700"
                    : "justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                }
                onClick={() => setMonthlyLimit(limit)}
                disabled={isLoading || isSaving}
              >
                {moneyFormatter.format(limit)}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Limite mensal definido</p>
                  <p className="text-3xl font-semibold tabular-nums">
                    {moneyFormatter.format(monthlyLimit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Uso atual</p>
                  <p className="text-3xl font-semibold tabular-nums text-emerald-700">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-emerald-600"
                  type="range"
                  min={1000}
                  max={20000}
                  step={100}
                  value={monthlyLimit}
                  disabled={isLoading || isSaving}
                  onChange={(event) =>
                    setMonthlyLimit(Math.max(Number(event.target.value), 1000))
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{moneyFormatter.format(1000)}</span>
                  <span>{moneyFormatter.format(20000)}</span>
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
                <Input
                  className="mt-2 text-right tabular-nums"
                  type="number"
                  min={1000}
                  step={100}
                  value={monthlyLimit}
                  disabled={isLoading || isSaving}
                  onChange={(event) =>
                    setMonthlyLimit(Math.max(Number(event.target.value), 1000))
                  }
                />
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
