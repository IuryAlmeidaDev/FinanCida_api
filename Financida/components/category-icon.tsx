import {
  CarIcon,
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
}: {
  category: ExpenseCategory
  className?: string
}) {
  const Icon = categoryIcons[category]

  return (
    <Icon
      aria-hidden="true"
      className={cn("size-4 shrink-0 text-emerald-600 dark:text-emerald-300", className)}
    />
  )
}
