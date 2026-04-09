import {
  CarIcon,
  CoinsIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HomeIcon,
  PartyPopperIcon,
  TagIcon,
  UsersRoundIcon,
  UtensilsIcon,
  WifiIcon,
  type LucideIcon,
} from "lucide-react"

import type { ExpenseCategory } from "@/lib/finance"
import { categoryThemeMap } from "@/lib/category-theme"
import { cn } from "@/lib/utils"

const categoryIcons: Record<ExpenseCategory, LucideIcon> = {
  Moradia: HomeIcon,
  Familia: UsersRoundIcon,
  Educacao: GraduationCapIcon,
  Comunicacao: WifiIcon,
  Transporte: CarIcon,
  Alimentacao: UtensilsIcon,
  Saude: HeartPulseIcon,
  Lazer: PartyPopperIcon,
  Outros: TagIcon,
}

export function CategoryIcon({
  category,
  className,
  withBadge = true,
}: {
  category: ExpenseCategory | "Receita"
  className?: string
  withBadge?: boolean
}) {
  const Icon = category === "Receita" ? CoinsIcon : categoryIcons[category]
  const theme = categoryThemeMap[category]

  if (!withBadge) {
    return (
      <Icon
        aria-hidden="true"
        className={cn("size-4 shrink-0", theme.iconClassName, className)}
      />
    )
  }

  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
        theme.iconSurfaceClassName,
        theme.iconBorderClassName,
        className
      )}
    >
      <Icon aria-hidden="true" className={cn("size-3.5", theme.iconClassName)} />
    </span>
  )
}
