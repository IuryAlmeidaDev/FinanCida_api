"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "@/components/category-icon"
import {
  getCategoryDefinition,
  type FinanceDataset,
  type FinancialSummary,
} from "@/lib/finance"
import { moneyFormatter } from "@/lib/formatters"

function downloadBlob(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function buildCsv(summary: FinancialSummary) {
  const rows = [
    ["Secao", "Indicador", "Valor"],
    ["Resumo", "Receitas", moneyFormatter.format(summary.totalRevenue)],
    ["Resumo", "Despesas fixas", moneyFormatter.format(summary.totalFixedExpenses)],
    ["Resumo", "Despesas variaveis", moneyFormatter.format(summary.totalVariableExpenses)],
    ["Resumo", "Saldo operacional", moneyFormatter.format(summary.operationalBalance)],
    ["Resumo", "Total a pagar", moneyFormatter.format(summary.totalToPay)],
    ["", "", ""],
    ["Categorias", "Categoria", "Valor"],
    ...summary.categoryTotals.map((item) => [
      "Categorias",
      item.category,
      moneyFormatter.format(item.total),
    ]),
  ]

  return `\uFEFF${rows.map((row) => row.join(";")).join("\n")}`
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function buildPdf(summary: FinancialSummary) {
  const lines = [
    "Relatorio Financida",
    "",
    `Receitas: ${moneyFormatter.format(summary.totalRevenue)}`,
    `Despesas fixas: ${moneyFormatter.format(summary.totalFixedExpenses)}`,
    `Despesas variaveis: ${moneyFormatter.format(summary.totalVariableExpenses)}`,
    `Saldo operacional: ${moneyFormatter.format(summary.operationalBalance)}`,
    `Total a pagar: ${moneyFormatter.format(summary.totalToPay)}`,
    "",
    "Categorias",
    ...summary.categoryTotals.map(
      (item) => `${item.category}: ${moneyFormatter.format(item.total)}`
    ),
  ]

  let y = 790
  const content = lines
    .map((line, index) => {
      const fontSize = index === 0 ? 18 : index === 8 ? 14 : 11
      const command = `BT /F1 ${fontSize} Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`
      y -= index === 0 ? 28 : 18
      return command
    })
    .join("\n")

  const objects = [
    `1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj`,
    `2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj`,
    `3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj`,
    `4 0 obj
<< /Length ${content.length} >>
stream
${content}
endstream
endobj`,
    `5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj`,
  ]

  let pdf = "%PDF-1.4\n"
  const offsets = [0]

  for (const object of objects) {
    offsets.push(pdf.length)
    pdf += `${object}\n`
  }

  const startXref = pdf.length
  pdf += `xref
0 6
0000000000 65535 f 
${offsets
  .slice(1)
  .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
  .join("\n")}
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${startXref}
%%EOF`

  return pdf
}

export function FinancialReports({
  summary,
  dataset,
}: {
  summary: FinancialSummary
  dataset: FinanceDataset
}) {
  function downloadReport(format: "csv" | "pdf") {
    if (format === "csv") {
      downloadBlob(buildCsv(summary), "relatorio-financida.csv", "text/csv;charset=utf-8")
      return
    }

    downloadBlob(buildPdf(summary), "relatorio-financida.pdf", "application/pdf")
  }

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <Card className="border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Resumo do periodo</CardTitle>
          <CardDescription>
            Uma leitura rapida para apoiar decisoes financeiras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <span>Receitas</span>
            <span className="font-semibold">{moneyFormatter.format(summary.totalRevenue)}</span>
          </div>
          <div className="flex justify-between rounded-xl bg-sky-50 p-3 dark:bg-sky-950/40">
            <span>Despesas fixas</span>
            <span className="font-semibold">{moneyFormatter.format(summary.totalFixedExpenses)}</span>
          </div>
          <div className="flex justify-between rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <span>Despesas variaveis</span>
            <span className="font-semibold">{moneyFormatter.format(summary.totalVariableExpenses)}</span>
          </div>
          <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-emerald-950/20">
            <span>Saldo operacional</span>
            <span className="font-semibold">{moneyFormatter.format(summary.operationalBalance)}</span>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadReport("csv")}>
            Excel/CSV organizado
          </Button>
          <Button size="sm" onClick={() => downloadReport("pdf")}>
            Baixar PDF
          </Button>
        </CardFooter>
      </Card>
      <Card className="border-emerald-100 dark:border-emerald-900/60">
        <CardHeader>
          <CardTitle>Despesas por categoria</CardTitle>
          <CardDescription>
            Categorias com maior impacto no mes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {summary.categoryTotals.map((item) => {
            const definition = getCategoryDefinition(dataset, item.category)

            return (
              <div
                key={item.category}
                className="flex justify-between gap-4 rounded-xl border border-emerald-50 p-3 dark:border-emerald-900/50"
              >
                <span className="flex items-center gap-2">
                  <CategoryIcon
                    category={item.category}
                    definition={definition}
                    color={definition.color}
                    withBadge
                  />
                  {item.category}
                </span>
                <span className="font-medium tabular-nums">
                  {moneyFormatter.format(item.total)}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
