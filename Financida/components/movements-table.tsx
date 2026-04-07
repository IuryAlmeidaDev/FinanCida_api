"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FinanceDataset } from "@/lib/finance"

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

export function MovementsTable({ dataset }: { dataset: FinanceDataset }) {
  const movements = [
    ...dataset.monthlyRevenues.map((revenue) => ({
      id: revenue.id,
      date: revenue.date,
      description: "Receita mensal",
      category: "Receita",
      type: "Receita",
      value: revenue.value,
      status: "-",
    })),
    ...dataset.fixedExpenses.map((expense) => ({
      id: expense.id,
      date: expense.transactionDate ?? "-",
      description: expense.description,
      category: expense.category,
      type: "Despesa fixa",
      value: expense.value,
      status: expense.status,
    })),
    ...dataset.variableExpenses.map((expense) => ({
      id: expense.id,
      date: expense.date,
      description: expense.description,
      category: expense.category,
      type: "Despesa variavel",
      value: expense.value,
      status: "-",
    })),
  ].sort((left, right) => right.date.localeCompare(left.date))

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Tudo que foi lançado</CardTitle>
          <CardDescription>
            Lista unificada de receitas, despesas fixas e despesas variaveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b bg-white text-black">
                <tr>
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium">Descricao</th>
                  <th className="px-3 py-2 font-medium">Categoria</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      {formatBrazilianDate(movement.date)}
                    </td>
                    <td className="px-3 py-2">{movement.description}</td>
                    <td className="px-3 py-2">{movement.category}</td>
                    <td className="px-3 py-2">{movement.type}</td>
                    <td className="px-3 py-2">{movement.status}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {moneyFormatter.format(movement.value)}
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
