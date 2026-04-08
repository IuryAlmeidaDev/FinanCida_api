"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CategoryIcon } from "@/components/category-icon"
import type { FinanceDataset } from "@/lib/finance"
import {
  listFinanceMovements,
  type MovementDeleteInput,
} from "@/lib/finance-movements"

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatBrazilianDate(date: string) {
  if (date === "-") {
    return date
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR")
}

export function MovementsTable({
  dataset,
  onMovementDelete,
}: {
  dataset: FinanceDataset
  onMovementDelete?: (movement: MovementDeleteInput) => void | Promise<void>
}) {
  const movements = listFinanceMovements(dataset)

  return (
    <div className="px-4 lg:px-6">
      <Card className="border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Tudo que foi lançado</CardTitle>
          <CardDescription>
            Lista unificada de receitas, despesas fixas e despesas variaveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-emerald-100 dark:border-emerald-900/60">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-emerald-100 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100">
                <tr>
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium">Descricao</th>
                  <th className="px-3 py-2 font-medium">Categoria</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Valor</th>
                  <th className="px-3 py-2 text-right font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-b border-emerald-50 transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/70 last:border-b-0 dark:border-emerald-900/40 dark:odd:bg-card dark:even:bg-emerald-950/10 dark:hover:bg-emerald-950/30"
                  >
                    <td className="px-3 py-2">
                      {formatBrazilianDate(movement.date)}
                    </td>
                    <td className="px-3 py-2">{movement.description}</td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        <CategoryIcon category={movement.category} />
                        {movement.category}
                      </span>
                    </td>
                    <td className="px-3 py-2">{movement.type}</td>
                    <td className="px-3 py-2">{movement.status}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {moneyFormatter.format(movement.value)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                        onClick={() =>
                          onMovementDelete?.({
                            id: movement.id,
                            source: movement.source,
                          })
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
