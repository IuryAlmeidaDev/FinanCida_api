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
import { buildMonthlyFinanceChartData } from "@/lib/finance-chart-data"

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

export function FinanceBarChart({
  dataset,
  range,
}: {
  dataset: FinanceDataset
  range: MonthYear
}) {
  const chartData = buildMonthlyFinanceChartData(dataset, range, 12)

  const currentMonth = chartData.at(-1)
  const balance = (currentMonth?.receita ?? 0) - (currentMonth?.despesa ?? 0)

  return (
    <Card className="@container/card flex h-full flex-col border-emerald-100 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60 dark:shadow-black/30">
      <CardHeader>
        <CardTitle>Receitas e despesas</CardTitle>
        <CardDescription>Historico dos ultimos 12 meses.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 pt-2">
        <ChartContainer config={chartConfig} className="min-h-[150px] w-full flex-1">
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
