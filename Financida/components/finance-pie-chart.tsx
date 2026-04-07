"use client"

import { Cell, Pie, PieChart } from "recharts"

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
import type { FinancialSummary } from "@/lib/finance"

const chartColors = [
  "#16a34a",
  "#2563eb",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#65a30d",
  "#ea580c",
]

const chartConfig = {
  total: {
    label: "Total",
  },
} satisfies ChartConfig

export function FinancePieChart({ summary }: { summary: FinancialSummary }) {
  const chartData = summary.categoryTotals.map((item, index) => ({
    category: item.category,
    total: item.total,
    fill: chartColors[index % chartColors.length],
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Despesas por categoria</CardTitle>
        <CardDescription>
          Distribuicao dos gastos no periodo selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="category" />}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="category"
              innerRadius={58}
              outerRadius={98}
              strokeWidth={2}
            >
              {chartData.map((item) => (
                <Cell key={item.category} fill={item.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span>{item.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
