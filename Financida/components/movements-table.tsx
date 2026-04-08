"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CategoryIcon } from "@/components/category-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FinanceDataset } from "@/lib/finance"
import {
  listFinanceMovements,
  type MovementDeleteInput,
  type MovementUpdateInput,
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
  onMovementEdit,
}: {
  dataset: FinanceDataset
  onMovementDelete?: (movement: MovementDeleteInput) => void | Promise<void>
  onMovementEdit?: (movement: MovementUpdateInput) => void | Promise<void>
}) {
  const movements = listFinanceMovements(dataset)
  const [editingMovementId, setEditingMovementId] = React.useState<string | null>(null)
  const editingMovement =
    movements.find((movement) => movement.id === editingMovementId) ?? null
  const [draftDate, setDraftDate] = React.useState("")
  const [draftDescription, setDraftDescription] = React.useState("")
  const [draftCategory, setDraftCategory] = React.useState("Outros")
  const [draftValue, setDraftValue] = React.useState("")
  const [draftStatus, setDraftStatus] = React.useState("Em aberto")

  React.useEffect(() => {
    if (!editingMovement) {
      return
    }

    setDraftDate(editingMovement.date === "-" ? "" : editingMovement.date)
    setDraftDescription(editingMovement.description)
    setDraftCategory(editingMovement.category)
    setDraftValue(String(editingMovement.value))
    setDraftStatus(editingMovement.status === "-" ? "Em aberto" : editingMovement.status)
  }, [editingMovement])

  async function handleSaveEdit() {
    if (!editingMovement || !draftDate) {
      return
    }

    await onMovementEdit?.({
      id: editingMovement.id,
      source: editingMovement.source,
      date: draftDate,
      description: draftDescription,
      category: draftCategory as MovementUpdateInput["category"],
      value: Number(draftValue.replace(",", ".")),
      status: draftStatus as MovementUpdateInput["status"],
    })

    setEditingMovementId(null)
  }

  return (
    <div className="px-4 lg:px-6">
      <Card className="border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Tudo que foi lancado</CardTitle>
          <CardDescription>
            Lista unificada de receitas, despesas fixas e despesas variaveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-emerald-100 dark:border-emerald-900/60">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-emerald-100 bg-emerald-50 text-emerald-900">
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
                    className="border-b border-emerald-50 transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/70 last:border-b-0"
                  >
                    <td className="px-3 py-2">{formatBrazilianDate(movement.date)}</td>
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
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                          onClick={() => setEditingMovementId(movement.id)}
                        >
                          Editar
                        </button>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {editingMovement ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Editar movimentacao
              </h2>
              <p className="text-sm text-muted-foreground">
                Ajuste valor, data e dados principais do lancamento.
              </p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} />
              <Input
                inputMode="decimal"
                value={draftValue}
                onChange={(event) => setDraftValue(event.target.value)}
                placeholder="Valor"
              />
              {editingMovement.source !== "revenue" ? (
                <>
                  <Input
                    value={draftDescription}
                    onChange={(event) => setDraftDescription(event.target.value)}
                    placeholder="Descricao"
                    className="md:col-span-2"
                  />
                  <select
                    className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                    value={draftCategory}
                    onChange={(event) => setDraftCategory(event.target.value)}
                  >
                    <option>Moradia</option>
                    <option>Familia</option>
                    <option>Educacao</option>
                    <option>Comunicacao</option>
                    <option>Transporte</option>
                    <option>Alimentacao</option>
                    <option>Saude</option>
                    <option>Lazer</option>
                    <option>Outros</option>
                  </select>
                </>
              ) : null}
              {editingMovement.source === "fixed-expense" ? (
                <select
                  className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                  value={draftStatus}
                  onChange={(event) => setDraftStatus(event.target.value)}
                >
                  <option>Em aberto</option>
                  <option>Pago</option>
                  <option>Atrasado</option>
                </select>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingMovementId(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void handleSaveEdit()}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
