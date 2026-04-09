import { Badge } from "@/components/ui/badge"
import { CategoryIcon } from "@/components/category-icon"
import type { ExpenseCategory } from "@/lib/finance"

const categoryStyles: Record<ExpenseCategory | "Receita", string> = {
  Receita: "border-emerald-200 bg-emerald-50/60 text-foreground",
  Moradia: "border-slate-200 bg-slate-50 text-foreground",
  Familia: "border-rose-200 bg-rose-50 text-foreground",
  Educacao: "border-indigo-200 bg-indigo-50 text-foreground",
  Comunicacao: "border-cyan-200 bg-cyan-50 text-foreground",
  Transporte: "border-amber-200 bg-amber-50 text-foreground",
  Alimentacao: "border-orange-200 bg-orange-50 text-foreground",
  Saude: "border-red-200 bg-red-50 text-foreground",
  Lazer: "border-fuchsia-200 bg-fuchsia-50 text-foreground",
  Outros: "border-zinc-200 bg-zinc-50 text-foreground",
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
      <CategoryIcon category={category} />
      {category}
    </Badge>
  )
}
