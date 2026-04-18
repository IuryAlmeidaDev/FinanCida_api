"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
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

  return (
    <Card className="@container/card flex h-full flex-col border-emerald-100 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60 dark:shadow-black/30">
      <CardHeader className="pb-2">
        <CardTitle>Receitas e despesas</CardTitle>
        <CardDescription>Histórico dos últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full aspect-auto"
        >
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
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
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
    </Card>
  )
}
