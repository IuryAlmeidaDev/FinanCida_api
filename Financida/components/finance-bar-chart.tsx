"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { FinanceDataset, MonthYear } from "@/lib/finance"

const chartConfig = {
  receita: {
    label: "Receita",
    color: "#007A55",
  },
  despesa: {
    label: "Despesa",
    color: "#ef4444",
  },
} satisfies ChartConfig

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
})

function createMonthDate(range: MonthYear, offset: number) {
  return new Date(range.year, range.month - 1 + offset, 1)
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function getDateMonthKey(value?: string) {
  return value ? value.slice(0, 7) : undefined
}

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export function FinanceBarChart({
  dataset,
  range,
}: {
  dataset: FinanceDataset
  range: MonthYear
}) {
  const chartData = Array.from({ length: 6 }, (_, index) => {
    const date = createMonthDate(range, index - 5)
    const monthKey = toMonthKey(date)
    const receita = sumValues(
      dataset.monthlyRevenues
        .filter((revenue) => getDateMonthKey(revenue.date) === monthKey)
        .map((revenue) => revenue.value)
    )
    const despesa = sumValues([
      ...dataset.fixedExpenses
        .filter((expense) => getDateMonthKey(expense.transactionDate) === monthKey)
        .map((expense) => expense.value),
      ...dataset.variableExpenses
        .filter((expense) => getDateMonthKey(expense.date) === monthKey)
        .map((expense) => expense.value),
    ])

    return {
      month: monthFormatter.format(date).replace(".", ""),
      receita,
      despesa,
    }
  })

  const currentMonth = chartData.at(-1)
  const balance = (currentMonth?.receita ?? 0) - (currentMonth?.despesa ?? 0)

  return (
    <Card className="@container/card flex h-full flex-col border-emerald-100 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60 dark:shadow-black/30">
      <CardHeader>
        <CardTitle>Receitas e despesas</CardTitle>
        <CardDescription>Comparativo dos ultimos 6 meses.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1">
        <ChartContainer config={chartConfig} className="min-h-[320px] w-full flex-1">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  formatter={(value, name) => (
                    <div className="flex min-w-32 items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ??
                          name}
                      </span>
                      <span className="font-mono font-medium text-foreground">
                        {typeof value === "number"
                          ? moneyFormatter.format(value)
                          : value}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="receita" fill="var(--color-receita)" radius={4} />
            <Bar dataKey="despesa" fill="var(--color-despesa)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Saldo do mes: {moneyFormatter.format(balance)}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Barras verdes indicam receitas e vermelhas indicam despesas.
        </div>
      </CardFooter>
    </Card>
  )
}
