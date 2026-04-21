import { FinanceWorkspace } from "@/components/finance-workspace"
import type { FinanceDataset } from "@/lib/finance"
import type { MovementInput } from "@/lib/finance-movements"

export function FinanceAddMovementDialog({
  dataset,
  onDatasetChange,
  onDatasetSave,
  onMovementCreate,
  onOpenChange,
  open,
}: {
  dataset: FinanceDataset
  onDatasetChange: (nextDataset: FinanceDataset) => void
  onDatasetSave: (nextDataset: FinanceDataset) => Promise<void>
  onMovementCreate: (movement: MovementInput) => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false)
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-movement-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-emerald-100 bg-card p-5 shadow-2xl shadow-emerald-950/10 dark:border-emerald-900/60 dark:shadow-black/40"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-movement-title"
              className="text-xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300"
            >
              Adicionar movimentação
            </h2>
            <p className="text-sm text-muted-foreground">
              Cadastre uma receita ou despesa sem sair da tela atual.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-emerald-200 bg-card px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-900/70 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </button>
        </div>
        <FinanceWorkspace
          dataset={dataset}
          onDatasetChange={(nextDataset) => {
            onDatasetChange(nextDataset)
            onOpenChange(false)
          }}
          onDatasetSave={onDatasetSave}
          onMovementCreate={async (movement) => {
            await onMovementCreate(movement)
            onOpenChange(false)
          }}
          showCalendar={false}
          showCategoryManager={false}
        />
      </div>
    </div>
  )
}
