"use client"

import * as React from "react"

import { handleUnauthorizedResponse } from "@/lib/client-auth"
import {
  calculateFinancialSummary,
  createEmptyFinanceDataset,
  getCurrentMonthYear,
  type FinanceDataset,
} from "@/lib/finance"
import type {
  MovementDeleteInput,
  MovementInput,
  MovementUpdateInput,
} from "@/lib/finance-movements"
import { getFinanceLoadErrorMessage } from "@/lib/finance-dashboard-queries"

export function useFinanceDashboardData() {
  const currentDate = React.useMemo(() => new Date(), [])
  const currentFinanceRange = React.useMemo(
    () => getCurrentMonthYear(currentDate),
    [currentDate]
  )
  const [dataset, setDataset] = React.useState<FinanceDataset>(
    createEmptyFinanceDataset()
  )
  const [isLoadingDataset, setIsLoadingDataset] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
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
      setIsLoadingDataset(true)
      setLoadError(null)
      const response = await fetch("/api/finance", { cache: "no-store" })

      if (handleUnauthorizedResponse(response)) {
        if (!ignore) {
          setIsLoadingDataset(false)
        }
        return
      }

      if (!response.ok) {
        if (!ignore) {
          setLoadError(getFinanceLoadErrorMessage())
          setIsLoadingDataset(false)
        }
        return
      }

      const payload = (await response.json()) as { dataset: FinanceDataset }

      if (!ignore) {
        setDataset(payload.dataset)
        setIsLoadingDataset(false)
      }
    }

    void loadDataset()

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

    if (handleUnauthorizedResponse(response)) {
      throw new Error("Sessão expirada.")
    }

    if (!response.ok) {
      throw new Error("Não foi possível salvar a movimentação.")
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

    if (handleUnauthorizedResponse(response)) {
      throw new Error("Sessão expirada.")
    }

    if (!response.ok) {
      throw new Error("Não foi possível remover a movimentação.")
    }

    const payload = (await response.json()) as { dataset: FinanceDataset }
    setDataset(payload.dataset)
  }

  async function handleDatasetSave(nextDataset: FinanceDataset) {
    const response = await fetch("/api/finance", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextDataset),
    })

    if (handleUnauthorizedResponse(response)) {
      throw new Error("Sessão expirada.")
    }

    if (!response.ok) {
      throw new Error("Não foi possível salvar as categorias.")
    }

    const payload = (await response.json()) as { dataset: FinanceDataset }
    setDataset(payload.dataset)
  }

  async function handleMovementEdit(movement: MovementUpdateInput) {
    const response = await fetch("/api/finance/movements", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movement),
    })

    if (handleUnauthorizedResponse(response)) {
      throw new Error("Sessão expirada.")
    }

    if (!response.ok) {
      throw new Error("Não foi possível atualizar a movimentação.")
    }

    const payload = (await response.json()) as { dataset: FinanceDataset }
    setDataset(payload.dataset)
  }

  return {
    currentFinanceRange,
    dataset,
    handleDatasetSave,
    handleMovementCreate,
    handleMovementDelete,
    handleMovementEdit,
    isLoadingDataset,
    loadError,
    setDataset,
    setLoadError,
    summary,
  }
}
