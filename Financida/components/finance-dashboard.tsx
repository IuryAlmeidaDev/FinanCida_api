"use client"

import * as React from "react"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { FinanceWorkspace } from "@/components/finance-workspace"
import { SectionCards } from "@/components/section-cards"
import { calculateFinancialSummary } from "@/lib/finance"
import {
  currentFinanceRange,
  financeDataset,
} from "@/lib/finance-sample-data"

import data from "@/app/dashboard/data.json"

export function FinanceDashboard() {
  const [dataset, setDataset] = React.useState(financeDataset)
  const summary = React.useMemo(
    () =>
      calculateFinancialSummary(
        dataset,
        currentFinanceRange,
        new Date("2026-04-07T00:00:00")
      ),
    [dataset]
  )

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards summary={summary} range={currentFinanceRange} />
      <FinanceWorkspace dataset={dataset} onDatasetChange={setDataset} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  )
}
