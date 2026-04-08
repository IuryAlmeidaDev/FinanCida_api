import { Badge } from "@/components/ui/badge"
import { CategoryIcon } from "@/components/category-icon"
import type { ExpenseCategory } from "@/lib/finance"

const categoryStyles: Record<ExpenseCategory | "Receita", string> = {
  Receita: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Moradia: "border-slate-200 bg-slate-100 text-slate-700",
  Familia: "border-rose-200 bg-rose-50 text-rose-700",
  Educacao: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Comunicacao: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Transporte: "border-amber-200 bg-amber-50 text-amber-700",
  Alimentacao: "border-orange-200 bg-orange-50 text-orange-700",
  Saude: "border-red-200 bg-red-50 text-red-700",
  Lazer: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  Outros: "border-zinc-200 bg-zinc-100 text-zinc-700",
}

export function CategoryBadge({
  category,
}: {
  category: ExpenseCategory | "Receita"
}) {
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${categoryStyles[category]}`}
    >
      <CategoryIcon category={category} className="text-current" />
      {category}
    </Badge>
  )
}
