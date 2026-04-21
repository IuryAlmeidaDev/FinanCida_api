import type {
  FinanceDataset,
  FinancialSummary,
  MonthYear,
} from "@/lib/finance"

export function getOverviewAlertMessage(pendingSharedAccountsCount: number) {
  return `Você tem ${pendingSharedAccountsCount} conta(s) compartilhada(s) aguardando aceite.`
}

export function getFinanceLoadErrorMessage() {
  return "Nao foi possivel carregar os dados financeiros."
}

export function getSharedAccountsLoadErrorMessage() {
  return "Nao foi possivel carregar as contas compartilhadas."
}

export type FinanceDashboardBaseProps = {
  dataset: FinanceDataset
  summary: FinancialSummary
  currentFinanceRange: MonthYear
}
