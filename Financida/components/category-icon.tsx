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

const categoryColors: Record<ExpenseCategory | "Receita", string> = {
  Receita: "text-emerald-600 dark:text-emerald-300",
  Moradia: "text-slate-600 dark:text-slate-300",
  Familia: "text-rose-600 dark:text-rose-300",
  Educacao: "text-indigo-600 dark:text-indigo-300",
  Comunicacao: "text-cyan-600 dark:text-cyan-300",
  Transporte: "text-amber-600 dark:text-amber-300",
  Alimentacao: "text-orange-600 dark:text-orange-300",
  Saude: "text-red-600 dark:text-red-300",
  Lazer: "text-fuchsia-600 dark:text-fuchsia-300",
  Outros: "text-zinc-600 dark:text-zinc-300",
}

export function CategoryIcon({
  category,
  className,
}: {
  category: ExpenseCategory | "Receita"
  className?: string
}) {
  const Icon = category === "Receita" ? CoinsIcon : categoryIcons[category]

  return (
    <Icon
      aria-hidden="true"
      className={cn("size-4 shrink-0", categoryColors[category], className)}
    />
  )
}
