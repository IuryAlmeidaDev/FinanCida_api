"use client"

import { Area, AreaChart, Line, LineChart, XAxis, YAxis } from "recharts"

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

const balanceConfig = {
  saldo: {
    label: "Saldo",
    color: "#15B789",
  },
} satisfies ChartConfig

const cashflowConfig = {
  receita: {
    label: "Receita",
    color: "#15B789",
  },
  despesa: {
    label: "Despesa",
    color: "#ef4444",
  },
} satisfies ChartConfig

export function FinanceOverviewCharts({
  dataset,
  range,
}: {
  dataset: FinanceDataset
  range: MonthYear
}) {
  const chartData = buildMonthlyFinanceChartData(dataset, range, 6)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Evolucao do saldo</CardTitle>
          <CardDescription>Ultimos 6 meses em formato compacto.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={balanceConfig} className="h-[210px] w-full">
            <LineChart accessibilityLayer data={chartData}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="var(--color-saldo)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Fluxo financeiro</CardTitle>
          <CardDescription>Receitas e despesas em area acumulada.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={cashflowConfig} className="h-[210px] w-full">
            <AreaChart accessibilityLayer data={chartData}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                type="monotone"
                dataKey="receita"
                fill="var(--color-receita)"
                fillOpacity={0.18}
                stroke="var(--color-receita)"
              />
              <Area
                type="monotone"
                dataKey="despesa"
                fill="var(--color-despesa)"
                fillOpacity={0.14}
                stroke="var(--color-despesa)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
