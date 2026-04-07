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
      <Card>
        <CardHeader>
          <CardTitle>Limite de gastos</CardTitle>
          <CardDescription>
            Acompanhe quanto do limite mensal ja foi usado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-black">Gasto atual</p>
              <p className="text-3xl font-semibold tabular-nums">
                {moneyFormatter.format(summary.totalExpenses)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-black">Limite mensal</p>
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
            <div className="h-4 overflow-hidden rounded-full border border-black bg-white">
              <div
                className="h-full bg-black"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
