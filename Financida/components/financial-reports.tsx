"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "@/components/category-icon"
import type { FinancialSummary } from "@/lib/finance"

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function FinancialReports({ summary }: { summary: FinancialSummary }) {
  function downloadReport(format: "csv" | "txt") {
    const rows = [
      ["Receitas", moneyFormatter.format(summary.totalRevenue)],
      ["Despesas fixas", moneyFormatter.format(summary.totalFixedExpenses)],
      ["Despesas variaveis", moneyFormatter.format(summary.totalVariableExpenses)],
      ["Saldo operacional", moneyFormatter.format(summary.operationalBalance)],
    ]
    const content =
      format === "csv"
        ? rows.map((row) => row.join(";")).join("\n")
        : rows.map((row) => `${row[0]}: ${row[1]}`).join("\n")
    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv;charset=utf-8" : "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-financida.${format}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <Card className="border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Resumo do periodo</CardTitle>
          <CardDescription>
            Uma leitura rapida para apoiar decisoes financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <span>Receitas</span>
            <span className="font-semibold">{moneyFormatter.format(summary.totalRevenue)}</span>
          </div>
          <div className="flex justify-between rounded-xl bg-sky-50 p-3 dark:bg-sky-950/40">
            <span>Despesas fixas</span>
            <span className="font-semibold">{moneyFormatter.format(summary.totalFixedExpenses)}</span>
          </div>
          <div className="flex justify-between rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <span>Despesas variaveis</span>
            <span className="font-semibold">{moneyFormatter.format(summary.totalVariableExpenses)}</span>
          </div>
          <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-emerald-950/20">
            <span>Saldo operacional</span>
            <span className="font-semibold">{moneyFormatter.format(summary.operationalBalance)}</span>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadReport("txt")}>
            TXT
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadReport("csv")}>
            Excel/CSV
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            Salvar PDF
          </Button>
        </CardFooter>
      </Card>
      <Card className="border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Despesas por categoria</CardTitle>
          <CardDescription>
            Categorias com maior impacto no mes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {summary.categoryTotals.map((item) => (
            <div
              key={item.category}
              className="flex justify-between gap-4 rounded-xl border border-emerald-50 p-3 dark:border-emerald-900/50"
            >
              <span className="flex items-center gap-2">
                <CategoryIcon category={item.category} />
                {item.category}
              </span>
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
