"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import type { FinancialSummary, MonthYear } from "@/lib/finance"

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
})

export function SectionCards({
  summary,
  range,
}: {
  summary: FinancialSummary
  range: MonthYear
}) {
  const expenseTrendIcon =
    summary.expenseGrowthRate > 0 ? TrendingUpIcon : TrendingDownIcon
  const ExpenseTrendIcon = expenseTrendIcon

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card border-emerald-100 bg-gradient-to-br from-white to-emerald-100/80 transition-colors hover:to-emerald-200/70 dark:border-emerald-900/60 dark:from-card dark:to-emerald-950/40 dark:hover:to-emerald-900/50">
        <CardHeader>
          <CardDescription>Receita mensal</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {moneyFormatter.format(summary.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-200 bg-white text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              <TrendingUpIcon />
              Entrada
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Receitas do periodo selecionado{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Baseado em {range.month}/{range.year}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card border-sky-100 bg-gradient-to-br from-white to-sky-100/80 transition-colors hover:to-sky-200/70 dark:border-sky-900/60 dark:from-card dark:to-sky-950/40 dark:hover:to-sky-900/50">
        <CardHeader>
          <CardDescription>Total de despesas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {moneyFormatter.format(summary.totalExpenses)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-sky-200 bg-white text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200">
              <ExpenseTrendIcon />
              {percentFormatter.format(summary.expenseGrowthRate)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Comparado ao mes anterior{" "}
            <ExpenseTrendIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Fixas + variaveis no periodo
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card border-emerald-100 bg-gradient-to-br from-white to-emerald-100/80 transition-colors hover:to-emerald-200/70 dark:border-emerald-900/60 dark:from-card dark:to-emerald-950/40 dark:hover:to-emerald-900/50">
        <CardHeader>
          <CardDescription>Saldo operacional</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {moneyFormatter.format(summary.operationalBalance)}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                summary.operationalBalance >= 0
                  ? "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-red-200 bg-white text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200"
              }
            >
              {summary.operationalBalance >= 0 ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}
              Saldo
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Receita menos despesas{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Indicador de saude financeira</div>
        </CardFooter>
      </Card>
      <Card className="@container/card border-amber-100 bg-gradient-to-br from-white to-amber-100/80 transition-colors hover:to-amber-200/70 dark:border-amber-900/60 dark:from-card dark:to-amber-950/40 dark:hover:to-amber-900/50">
        <CardHeader>
          <CardDescription>Total a pagar</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {moneyFormatter.format(summary.totalToPay)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-red-200 bg-white text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200">
              <TrendingDownIcon />
              {moneyFormatter.format(summary.totalLate)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Variaveis + em aberto + atrasado{" "}
            <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Pago: {moneyFormatter.format(summary.totalPaid)}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
