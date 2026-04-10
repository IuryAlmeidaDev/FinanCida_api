"use client"

import {
  BriefcaseBusinessIcon,
  CarIcon,
  CoinsIcon,
  Gamepad2Icon,
  GraduationCapIcon,
  HeartPulseIcon,
  HomeIcon,
  PartyPopperIcon,
  PlaneIcon,
  ShoppingBagIcon,
  ShirtIcon,
  TagIcon,
  UsersRoundIcon,
  UtensilsIcon,
  WalletIcon,
  WifiIcon,
  type LucideIcon,
} from "lucide-react"

import type {
  CategoryDefinition,
  CategoryIconName,
  ExpenseCategory,
} from "@/lib/finance"
import { cn } from "@/lib/utils"

const iconMap: Record<CategoryIconName | "revenue", LucideIcon> = {
  home: HomeIcon,
  users: UsersRoundIcon,
  graduation: GraduationCapIcon,
  wifi: WifiIcon,
  car: CarIcon,
  utensils: UtensilsIcon,
  heart: HeartPulseIcon,
  party: PartyPopperIcon,
  tag: TagIcon,
  wallet: WalletIcon,
  shopping: ShoppingBagIcon,
  briefcase: BriefcaseBusinessIcon,
  shirt: ShirtIcon,
  gamepad: Gamepad2Icon,
  plane: PlaneIcon,
  revenue: CoinsIcon,
}

export const categoryIconOptions: Array<{
  value: CategoryIconName
  label: string
}> = [
  { value: "home", label: "Casa" },
  { value: "users", label: "Familia" },
  { value: "graduation", label: "Educacao" },
  { value: "wifi", label: "Internet" },
  { value: "car", label: "Carro" },
  { value: "utensils", label: "Comida" },
  { value: "heart", label: "Saude" },
  { value: "party", label: "Lazer" },
  { value: "tag", label: "Etiqueta" },
  { value: "wallet", label: "Carteira" },
  { value: "shopping", label: "Compras" },
  { value: "briefcase", label: "Trabalho" },
  { value: "shirt", label: "Roupas" },
  { value: "gamepad", label: "Games" },
  { value: "plane", label: "Viagem" },
]

function buildSurfaceStyle(color?: string) {
  if (!color) {
    return undefined
  }

  return {
    borderColor: `${color}3d`,
    backgroundColor: `${color}14`,
    color,
  }
}

export function CategoryIcon({
  category,
  definition,
  className,
  color,
  withBadge = false,
}: {
  category: ExpenseCategory | "Receita"
  definition?: CategoryDefinition
  className?: string
  color?: string
  withBadge?: boolean
}) {
  const iconName = category === "Receita" ? "revenue" : definition?.icon ?? "tag"
  const iconColor = color ?? definition?.color ?? (category === "Receita" ? "#16a34a" : "#71717a")
  const Icon = iconMap[iconName]

  if (!withBadge) {
    return (
      <Icon
        aria-hidden="true"
        className={cn("size-4 shrink-0", className)}
        style={{ color: iconColor }}
      />
    )
  }

  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
        className
      )}
      style={buildSurfaceStyle(iconColor)}
    >
      <Icon aria-hidden="true" className="size-3.5" style={{ color: iconColor }} />
    </span>
  )
}
