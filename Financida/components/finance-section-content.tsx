import { CryptoDashboard } from "@/components/crypto-dashboard"
import { FinancialReports } from "@/components/financial-reports"
import { FinanceOverviewSection } from "@/components/finance-overview-section"
import { FinanceWorkspace } from "@/components/finance-workspace"
import { FriendAccountsDashboard } from "@/components/friend-accounts-dashboard"
import { FriendsDashboard } from "@/components/friends-dashboard"
import { MovementsTable } from "@/components/movements-table"
import { SpendingLimit } from "@/components/spending-limit"
import type { DashboardSectionKind } from "@/lib/dashboard-sections"
import type { FinanceDataset, FinancialSummary, MonthYear } from "@/lib/finance"
import type {
  MovementDeleteInput,
  MovementInput,
  MovementUpdateInput,
} from "@/lib/finance-movements"

export function FinanceSectionContent({
  currentFinanceRange,
  dataset,
  handleDatasetSave,
  handleMovementCreate,
  handleMovementDelete,
  handleMovementEdit,
  isLoadingDataset,
  loadError,
  pendingSharedAccountsCount,
  sectionKind,
  setDataset,
  summary,
}: {
  currentFinanceRange: MonthYear
  dataset: FinanceDataset
  handleDatasetSave: (nextDataset: FinanceDataset) => Promise<void>
  handleMovementCreate: (movement: MovementInput) => Promise<void>
  handleMovementDelete: (movement: MovementDeleteInput) => Promise<void>
  handleMovementEdit: (movement: MovementUpdateInput) => Promise<void>
  isLoadingDataset: boolean
  loadError: string | null
  pendingSharedAccountsCount: number
  sectionKind: DashboardSectionKind
  setDataset: (nextDataset: FinanceDataset) => void
  summary: FinancialSummary
}) {
  if (sectionKind === "movements") {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <FinanceWorkspace
          dataset={dataset}
          onDatasetChange={setDataset}
          onDatasetSave={handleDatasetSave}
          onMovementCreate={handleMovementCreate}
          showCalendar={false}
          showCategoryManager={true}
        />
        <MovementsTable
          dataset={dataset}
          onMovementDelete={handleMovementDelete}
          onMovementEdit={handleMovementEdit}
        />
      </div>
    )
  }

  if (sectionKind === "reports") {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <FinancialReports summary={summary} dataset={dataset} />
      </div>
    )
  }

  if (sectionKind === "limit") {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SpendingLimit summary={summary} />
      </div>
    )
  }

  if (sectionKind === "crypto") {
    return (
      <div className="flex flex-col gap-4">
        <CryptoDashboard />
      </div>
    )
  }

  if (sectionKind === "friends") {
    return (
      <div className="flex flex-col gap-4">
        <FriendsDashboard />
      </div>
    )
  }

  if (sectionKind === "sharedAccounts") {
    return (
      <div className="flex flex-col gap-4">
        <FriendAccountsDashboard />
      </div>
    )
  }

  return (
    <FinanceOverviewSection
      currentFinanceRange={currentFinanceRange}
      dataset={dataset}
      handleDatasetSave={handleDatasetSave}
      handleMovementCreate={handleMovementCreate}
      isLoadingDataset={isLoadingDataset}
      loadError={loadError}
      pendingSharedAccountsCount={pendingSharedAccountsCount}
      setDataset={setDataset}
      summary={summary}
    />
  )
}
