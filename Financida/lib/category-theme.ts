import type { ExpenseCategory } from "@/lib/finance"

export type CategoryTheme = {
  iconClassName: string
  chipClassName: string
  chartColor: string
  iconRingClassName: string
  iconSurfaceClassName: string
}

export const categoryThemeMap: Record<ExpenseCategory | "Receita", CategoryTheme> = {
  Receita: {
    iconClassName: "text-emerald-700 dark:text-emerald-300",
    chipClassName: "border-emerald-200 bg-emerald-50/70 text-foreground",
    chartColor: "#059669",
    iconRingClassName: "ring-emerald-200/90 dark:ring-emerald-900/70",
    iconSurfaceClassName: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  Moradia: {
    iconClassName: "text-slate-700 dark:text-slate-300",
    chipClassName: "border-slate-200 bg-slate-50 text-foreground",
    chartColor: "#475569",
    iconRingClassName: "ring-slate-200/90 dark:ring-slate-800/70",
    iconSurfaceClassName: "bg-slate-50 dark:bg-slate-950/40",
  },
  Familia: {
    iconClassName: "text-rose-700 dark:text-rose-300",
    chipClassName: "border-rose-200 bg-rose-50 text-foreground",
    chartColor: "#e11d48",
    iconRingClassName: "ring-rose-200/90 dark:ring-rose-900/70",
    iconSurfaceClassName: "bg-rose-50 dark:bg-rose-950/40",
  },
  Educacao: {
    iconClassName: "text-indigo-700 dark:text-indigo-300",
    chipClassName: "border-indigo-200 bg-indigo-50 text-foreground",
    chartColor: "#4f46e5",
    iconRingClassName: "ring-indigo-200/90 dark:ring-indigo-900/70",
    iconSurfaceClassName: "bg-indigo-50 dark:bg-indigo-950/40",
  },
  Comunicacao: {
    iconClassName: "text-cyan-700 dark:text-cyan-300",
    chipClassName: "border-cyan-200 bg-cyan-50 text-foreground",
    chartColor: "#0891b2",
    iconRingClassName: "ring-cyan-200/90 dark:ring-cyan-900/70",
    iconSurfaceClassName: "bg-cyan-50 dark:bg-cyan-950/40",
  },
  Transporte: {
    iconClassName: "text-amber-700 dark:text-amber-300",
    chipClassName: "border-amber-200 bg-amber-50 text-foreground",
    chartColor: "#d97706",
    iconRingClassName: "ring-amber-200/90 dark:ring-amber-900/70",
    iconSurfaceClassName: "bg-amber-50 dark:bg-amber-950/40",
  },
  Alimentacao: {
    iconClassName: "text-orange-700 dark:text-orange-300",
    chipClassName: "border-orange-200 bg-orange-50 text-foreground",
    chartColor: "#ea580c",
    iconRingClassName: "ring-orange-200/90 dark:ring-orange-900/70",
    iconSurfaceClassName: "bg-orange-50 dark:bg-orange-950/40",
  },
  Saude: {
    iconClassName: "text-red-700 dark:text-red-300",
    chipClassName: "border-red-200 bg-red-50 text-foreground",
    chartColor: "#dc2626",
    iconRingClassName: "ring-red-200/90 dark:ring-red-900/70",
    iconSurfaceClassName: "bg-red-50 dark:bg-red-950/40",
  },
  Lazer: {
    iconClassName: "text-fuchsia-700 dark:text-fuchsia-300",
    chipClassName: "border-fuchsia-200 bg-fuchsia-50 text-foreground",
    chartColor: "#c026d3",
    iconRingClassName: "ring-fuchsia-200/90 dark:ring-fuchsia-900/70",
    iconSurfaceClassName: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
  },
  Outros: {
    iconClassName: "text-zinc-700 dark:text-zinc-300",
    chipClassName: "border-zinc-200 bg-zinc-50 text-foreground",
    chartColor: "#52525b",
    iconRingClassName: "ring-zinc-200/90 dark:ring-zinc-800/70",
    iconSurfaceClassName: "bg-zinc-50 dark:bg-zinc-950/40",
  },
}
