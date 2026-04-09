import { Badge } from "@/components/ui/badge"
import { CategoryIcon } from "@/components/category-icon"
import { categoryThemeMap } from "@/lib/category-theme"
import type { ExpenseCategory } from "@/lib/finance"

export function CategoryBadge({
  category,
}: {
  category: ExpenseCategory | "Receita"
}) {
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${categoryThemeMap[category].chipClassName}`}
    >
      <CategoryIcon category={category} />
      {category}
    </Badge>
  )
}
