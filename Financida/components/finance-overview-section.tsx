import { BellRingIcon } from "lucide-react"

import { FinanceBarChart } from "@/components/finance-bar-chart"
import { FinanceOverviewCharts } from "@/components/finance-overview-charts"
import { FinancePieChart } from "@/components/finance-pie-chart"
import { FinanceWorkspace } from "@/components/finance-workspace"
import { SectionCards } from "@/components/section-cards"
import type { FinanceDataset, FinancialSummary, MonthYear } from "@/lib/finance"
import { getOverviewAlertMessage } from "@/lib/finance-dashboard-queries"
import type { MovementInput } from "@/lib/finance-movements"

export function FinanceOverviewSection({
  currentFinanceRange,
  dataset,
  handleDatasetSave,
  handleMovementCreate,
  isLoadingDataset,
  loadError,
  pendingSharedAccountsCount,
  setDataset,
  summary,
}: {
  currentFinanceRange: MonthYear
  dataset: FinanceDataset
  handleDatasetSave: (nextDataset: FinanceDataset) => Promise<void>
  handleMovementCreate: (movement: MovementInput) => Promise<void>
  isLoadingDataset: boolean
  loadError: string | null
  pendingSharedAccountsCount: number
  setDataset: (nextDataset: FinanceDataset) => void
  summary: FinancialSummary
}) {
  return (
    <div className="flex flex-col gap-3 py-3 md:gap-4 md:py-4">
      {isLoadingDataset ? (
        <div className="px-4 text-sm text-muted-foreground lg:px-6">
          Carregando dados financeiros...
        </div>
      ) : null}
      {loadError ? (
        <div className="px-4 lg:px-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {loadError}
          </div>
        </div>
      ) : null}
      {pendingSharedAccountsCount > 0 ? (
        <div className="px-4 lg:px-6">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <BellRingIcon className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">
                {getOverviewAlertMessage(pendingSharedAccountsCount)}
              </p>
              <p className="text-sm text-amber-800/80">
                Abra a aba de contas compartilhadas para aceitar ou recusar.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <SectionCards summary={summary} range={currentFinanceRange} />
      <div className="grid w-full items-stretch gap-3 px-4 xl:grid-cols-[272px_minmax(0,4fr)_minmax(0,5fr)] xl:auto-rows-fr lg:px-6">
        <div className="min-w-0 h-full [&>div]:h-full [&>div]:max-w-none [&>div]:px-0 [&>div]:lg:px-0">
          <FinanceWorkspace
            dataset={dataset}
            onDatasetChange={setDataset}
            onDatasetSave={handleDatasetSave}
            onMovementCreate={handleMovementCreate}
            showForm={false}
          />
        </div>
        <div className="min-w-0 h-full">
          <FinancePieChart summary={summary} dataset={dataset} />
        </div>
        <div className="min-w-0 h-full">
          <FinanceBarChart dataset={dataset} range={currentFinanceRange} />
        </div>
        <div className="xl:col-span-3">
          <FinanceOverviewCharts dataset={dataset} range={currentFinanceRange} />
        </div>
      </div>
    </div>
  )
}
