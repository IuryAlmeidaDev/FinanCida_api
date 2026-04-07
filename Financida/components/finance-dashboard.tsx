"use client"

import * as React from "react"

import { FinancialReports } from "@/components/financial-reports"
import { FinancePieChart } from "@/components/finance-pie-chart"
import { FinanceWorkspace } from "@/components/finance-workspace"
import { MovementsTable } from "@/components/movements-table"
import { SectionCards } from "@/components/section-cards"
import { SpendingLimit } from "@/components/spending-limit"
import { calculateFinancialSummary } from "@/lib/finance"
import {
  currentFinanceRange,
  financeDataset,
} from "@/lib/finance-sample-data"

export function FinanceDashboard({
  activeSection,
  addDialogOpen,
  onAddDialogOpenChange,
}: {
  activeSection: string
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
}) {
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

  const addMovementDialog = addDialogOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-emerald-200 bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-emerald-700">
              Adicionar movimentacao
            </h2>
            <p className="text-sm text-slate-600">
              Cadastre uma receita ou despesa sem sair da tela atual.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-emerald-200 px-3 py-1 text-sm text-emerald-700"
            onClick={() => onAddDialogOpenChange(false)}
          >
            Fechar
          </button>
        </div>
        <FinanceWorkspace
          dataset={dataset}
          onDatasetChange={(nextDataset) => {
            setDataset(nextDataset)
            onAddDialogOpenChange(false)
          }}
          showCalendar={false}
        />
      </div>
    </div>
  ) : null

  if (activeSection.startsWith("lan")) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <FinanceWorkspace
          dataset={dataset}
          onDatasetChange={setDataset}
          showCalendar={false}
        />
        <MovementsTable dataset={dataset} />
        {addMovementDialog}
      </div>
    )
  }

  if (activeSection.startsWith("relat")) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <FinancialReports summary={summary} />
        {addMovementDialog}
      </div>
    )
  }

  if (activeSection.startsWith("limite")) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SpendingLimit summary={summary} />
        {addMovementDialog}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards summary={summary} range={currentFinanceRange} />
      <div className="grid gap-4 px-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
        <FinancePieChart summary={summary} />
        <div className="[&>div]:px-0 [&>div]:lg:px-0">
          <FinanceWorkspace
            dataset={dataset}
            onDatasetChange={setDataset}
            showForm={false}
          />
        </div>
      </div>
      {addMovementDialog}
    </div>
  )
}
