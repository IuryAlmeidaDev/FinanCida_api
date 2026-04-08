"use client"

import { Cell, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CategoryIcon } from "@/components/category-icon"
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
  const hasData = chartData.length > 0
  const pieData = hasData
    ? chartData
    : [
        {
          category: "Sem dados",
          total: 1,
          fill: "#94a3b8",
        },
      ]

  return (
    <Card className="@container/card h-full border-emerald-100 shadow-lg shadow-emerald-950/5 dark:border-emerald-900/60 dark:shadow-black/30">
      <CardHeader>
        <CardTitle>Despesas por categoria</CardTitle>
        <CardDescription>
          Distribuicao dos gastos no periodo selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-4 px-4 pt-4 sm:px-6 sm:pt-6 2xl:flex-row 2xl:items-center 2xl:justify-center 2xl:gap-8">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[240px] w-full sm:h-[300px] 2xl:h-[320px] 2xl:w-auto 2xl:flex-1 2xl:max-w-none"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="category" />}
            />
            <Pie
              data={pieData}
              dataKey="total"
              nameKey="category"
              innerRadius="56%"
              outerRadius="92%"
              strokeWidth={2}
            >
              {pieData.map((item) => (
                <Cell key={item.category} fill={item.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="grid w-full gap-2 text-sm sm:grid-cols-2 2xl:w-auto 2xl:flex-1 2xl:grid-cols-1">
          {!hasData && (
            <p className="text-sm text-muted-foreground">
              Sem despesas no periodo selecionado.
            </p>
          )}
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <CategoryIcon category={item.category} className="size-3.5" />
              <span>{item.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
