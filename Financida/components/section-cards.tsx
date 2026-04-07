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
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-white *:data-[slot=card]:text-black *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-white">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Receita mensal</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {moneyFormatter.format(summary.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-black text-black">
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
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de despesas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {moneyFormatter.format(summary.totalExpenses)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-black text-black">
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
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saldo operacional</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {moneyFormatter.format(summary.operationalBalance)}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                "border-black text-black"
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
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total a pagar</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {moneyFormatter.format(summary.totalToPay)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-black text-black">
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
