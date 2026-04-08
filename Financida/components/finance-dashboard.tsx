"use client"

import * as React from "react"

import { FinancialReports } from "@/components/financial-reports"
import { FinanceBarChart } from "@/components/finance-bar-chart"
import { FinancePieChart } from "@/components/finance-pie-chart"
import { FinanceWorkspace } from "@/components/finance-workspace"
import { MovementsTable } from "@/components/movements-table"
import { SectionCards } from "@/components/section-cards"
import { SpendingLimit } from "@/components/spending-limit"
import {
  calculateFinancialSummary,
  createEmptyFinanceDataset,
  getCurrentMonthYear,
  type FinanceDataset,
} from "@/lib/finance"
import type { MovementInput } from "@/lib/finance-movements"
import type { MovementDeleteInput } from "@/lib/finance-movements"

export function FinanceDashboard({
  activeSection,
  addDialogOpen,
  onAddDialogOpenChange,
}: {
  activeSection: string
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
}) {
  const currentDate = React.useMemo(() => new Date(), [])
  const currentFinanceRange = React.useMemo(
    () => getCurrentMonthYear(currentDate),
    [currentDate]
  )
  const [dataset, setDataset] = React.useState<FinanceDataset>(
    createEmptyFinanceDataset()
  )
  const summary = React.useMemo(
    () =>
      calculateFinancialSummary(
        dataset,
        currentFinanceRange,
        currentDate
      ),
    [dataset, currentDate, currentFinanceRange]
  )

  React.useEffect(() => {
    let ignore = false

    async function loadDataset() {
      const response = await fetch("/api/finance", { cache: "no-store" })

      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as { dataset: FinanceDataset }

      if (!ignore) {
        setDataset(payload.dataset)
      }
    }

    loadDataset()

    return () => {
      ignore = true
    }
  }, [])

  async function handleMovementCreate(movement: MovementInput) {
    const response = await fetch("/api/finance/movements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movement),
    })

    if (!response.ok) {
      throw new Error("Nao foi possivel salvar a movimentacao.")
    }

    const payload = (await response.json()) as { dataset: FinanceDataset }
    setDataset(payload.dataset)
  }

  async function handleMovementDelete(movement: MovementDeleteInput) {
    const response = await fetch("/api/finance/movements", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movement),
    })

    if (!response.ok) {
      throw new Error("Nao foi possivel remover a movimentacao.")
    }

    const payload = (await response.json()) as { dataset: FinanceDataset }
    setDataset(payload.dataset)
  }

  const addMovementDialog = addDialogOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-emerald-100 bg-card p-5 shadow-2xl shadow-emerald-950/10 dark:border-emerald-900/60 dark:shadow-black/40">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
              Adicionar movimentacao
            </h2>
            <p className="text-sm text-muted-foreground">
              Cadastre uma receita ou despesa sem sair da tela atual.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-emerald-200 bg-card px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-900/70 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
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
          onMovementCreate={async (movement) => {
            await handleMovementCreate(movement)
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
          onMovementCreate={handleMovementCreate}
          showCalendar={false}
        />
        <MovementsTable
          dataset={dataset}
          onMovementDelete={handleMovementDelete}
        />
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
      <div className="grid max-w-[92rem] items-stretch gap-4 px-4 xl:grid-cols-[minmax(320px,420px)_minmax(420px,1fr)] lg:px-6">
        <div className="h-full [&>div]:h-full [&>div]:max-w-none [&>div]:px-0 [&>div]:lg:px-0">
          <FinanceWorkspace
            dataset={dataset}
            onDatasetChange={setDataset}
            onMovementCreate={handleMovementCreate}
            showForm={false}
          />
        </div>
        <div className="h-full">
          <FinancePieChart summary={summary} />
        </div>
        <div className="h-full xl:col-span-2">
          <FinanceBarChart dataset={dataset} range={currentFinanceRange} />
        </div>
      </div>
      {addMovementDialog}
    </div>
  )
}
