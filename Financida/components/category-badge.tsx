"use client"

import { Badge } from "@/components/ui/badge"
import { CategoryIcon } from "@/components/category-icon"
import {
  getCategoryDefinition,
  type CategoryDefinition,
  type ExpenseCategory,
} from "@/lib/finance"

function hexToRgb(color: string) {
  const normalized = color.replace("#", "")
  const value = Number.parseInt(normalized, 16)

  if (Number.isNaN(value)) {
    return { red: 113, green: 113, blue: 122 }
  }

  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  }
}

export function CategoryBadge({
  category,
  categories,
}: {
  category: ExpenseCategory | "Receita"
  categories?: CategoryDefinition[]
}) {
  const categoryLabel = category === "Familia" ? "Família" : category
  const definition =
    category === "Receita" || !categories
      ? undefined
      : getCategoryDefinition({ categories }, category)
  const rgb = hexToRgb(definition?.color ?? "#16a34a")

  return (
    <Badge
      variant="outline"
      className="gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        borderColor: `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, 0.28)`,
        backgroundColor: `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, 0.14)`,
        color: definition?.color ?? "#15803d",
      }}
    >
      <CategoryIcon
        category={category}
        definition={definition}
        color={definition?.color}
        className="text-current"
      />
      {categoryLabel}
    </Badge>
  )
}
