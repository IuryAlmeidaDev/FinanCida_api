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

export function FinancialReports({ summary }: { summary: FinancialSummary }) {
  return (
    <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo do periodo</CardTitle>
          <CardDescription>
            Uma leitura rapida para apoiar decisoes financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Receitas: {moneyFormatter.format(summary.totalRevenue)}</p>
          <p>Despesas fixas: {moneyFormatter.format(summary.totalFixedExpenses)}</p>
          <p>Despesas variaveis: {moneyFormatter.format(summary.totalVariableExpenses)}</p>
          <p>Saldo operacional: {moneyFormatter.format(summary.operationalBalance)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Despesas por categoria</CardTitle>
          <CardDescription>
            Categorias com maior impacto no mes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {summary.categoryTotals.map((item) => (
            <div key={item.category} className="flex justify-between gap-4">
              <span>{item.category}</span>
              <span className="font-medium tabular-nums">
                {moneyFormatter.format(item.total)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
