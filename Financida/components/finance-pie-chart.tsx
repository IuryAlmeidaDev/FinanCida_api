"use client"

import { Cell, Pie, PieChart } from "recharts"

import { CategoryIcon } from "@/components/category-icon"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getCategoryDefinition,
  type FinanceDataset,
  type FinancialSummary,
} from "@/lib/finance"

const chartConfig = {
  total: {
    label: "Total",
  },
} satisfies ChartConfig

function formatCategoryLabel(category: string) {
  if (category === "Familia") {
    return "Família"
  }

  return category
}

export function FinancePieChart({
  summary,
  dataset,
}: {
  summary: FinancialSummary
  dataset: FinanceDataset
}) {
  const chartData = summary.categoryTotals.map((item) => ({
    category: item.category,
    total: item.total,
    fill: getCategoryDefinition(dataset, item.category).color,
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
          Distribuição dos gastos no período selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-4 px-4 pt-3 sm:px-5 sm:pt-4 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[200px] w-full sm:h-[230px] xl:h-[240px] xl:flex-[0.8] xl:max-w-none"
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
        <div className="grid w-full gap-1.5 text-xs sm:grid-cols-2 xl:flex-[1.2]">
          {!hasData && (
            <p className="text-sm text-muted-foreground">
              Sem despesas no período selecionado.
            </p>
          )}
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <CategoryIcon
                category={item.category}
                definition={getCategoryDefinition(dataset, item.category)}
                color={item.fill}
                className="size-3.5"
              />
              <span>{formatCategoryLabel(item.category)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
