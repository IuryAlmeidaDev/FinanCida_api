"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FinancialSummary } from "@/lib/finance"

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function SpendingLimit({ summary }: { summary: FinancialSummary }) {
  const monthlyLimit = 6000
  const percentage = Math.min((summary.totalExpenses / monthlyLimit) * 100, 100)

  return (
    <div className="px-4 lg:px-6">
      <Card className="border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Limite de gastos</CardTitle>
          <CardDescription>
            Acompanhe quanto do limite mensal ja foi usado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gasto atual</p>
              <p className="text-3xl font-semibold tabular-nums">
                {moneyFormatter.format(summary.totalExpenses)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Limite mensal</p>
              <p className="text-xl font-medium tabular-nums">
                {moneyFormatter.format(monthlyLimit)}
              </p>
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>{percentage.toFixed(1)}% usado</span>
              <span>{moneyFormatter.format(monthlyLimit - summary.totalExpenses)} restante</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:ring-emerald-900/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-300 dark:to-emerald-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
