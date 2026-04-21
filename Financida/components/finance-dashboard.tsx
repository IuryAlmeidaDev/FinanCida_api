"use client"

import { FinanceAddMovementDialog } from "@/components/finance-add-movement-dialog"
import { FinanceSectionContent } from "@/components/finance-section-content"
import { useFinanceDashboardData } from "@/hooks/use-finance-dashboard-data"
import { usePendingSharedAccounts } from "@/hooks/use-pending-shared-accounts"
import { getDashboardSectionKind } from "@/lib/dashboard-sections"

export function FinanceDashboard({
  activeSection,
  addDialogOpen,
  onAddDialogOpenChange,
}: {
  activeSection: string
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
}) {
  const sectionKind = getDashboardSectionKind(activeSection)
  const {
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
  } = useFinanceDashboardData()
  const { pendingSharedAccountsCount } = usePendingSharedAccounts(setLoadError)

  return (
    <>
      <FinanceSectionContent
        currentFinanceRange={currentFinanceRange}
        dataset={dataset}
        handleDatasetSave={handleDatasetSave}
        handleMovementCreate={handleMovementCreate}
        handleMovementDelete={handleMovementDelete}
        handleMovementEdit={handleMovementEdit}
        isLoadingDataset={isLoadingDataset}
        loadError={loadError}
        pendingSharedAccountsCount={pendingSharedAccountsCount}
        sectionKind={sectionKind}
        setDataset={setDataset}
        summary={summary}
      />
      <FinanceAddMovementDialog
        dataset={dataset}
        onDatasetChange={setDataset}
        onDatasetSave={handleDatasetSave}
        onMovementCreate={handleMovementCreate}
        onOpenChange={onAddDialogOpenChange}
        open={addDialogOpen}
      />
    </>
  )
}
