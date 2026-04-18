"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type CalendarMarker = {
  date: string
  type: "revenue" | "expense" | "both"
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function Calendar({
  selected,
  onSelect,
  month,
  markers = [],
  className,
}: {
  selected?: Date
  onSelect?: (date: Date) => void
  month?: Date
  markers?: CalendarMarker[]
  className?: string
}) {
  const [visibleMonth, setVisibleMonth] = React.useState(month ?? selected ?? new Date())

  React.useEffect(() => {
    if (month) {
      setVisibleMonth(month)
      return
    }

    if (selected) {
      setVisibleMonth(selected)
    }
  }, [month, selected])

  const year = visibleMonth.getFullYear()
  const monthIndex = visibleMonth.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const startOffset = firstDay.getDay()
  const totalCalendarCells = 42
  const markerMap = new Map(markers.map((marker) => [marker.date, marker.type]))
  const monthLabel = visibleMonth.toLocaleDateString("pt-BR", {
    month: "long",
  })
  const yearLabel = visibleMonth.toLocaleDateString("pt-BR", {
    year: "numeric",
  })

  return (
    <div
      className={cn(
        "w-[248px] rounded-2xl bg-gradient-to-br from-white via-emerald-50/30 to-slate-50 p-3 shadow-lg shadow-emerald-950/5 ring-1 ring-emerald-100 dark:from-emerald-950/20 dark:via-card dark:to-card dark:shadow-black/30 dark:ring-emerald-900/60",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-xl border border-transparent bg-transparent text-foreground/65 transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/70"
          onClick={() => setVisibleMonth(new Date(year, monthIndex - 1, 1))}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <div className="flex min-h-11 flex-col items-center justify-center text-center">
          <span className="text-sm font-semibold capitalize text-foreground/85 transition-all duration-200">
            {monthLabel}
          </span>
          <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {yearLabel}
          </span>
        </div>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-xl border border-transparent bg-transparent text-foreground/65 transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/70"
          onClick={() => setVisibleMonth(new Date(year, monthIndex + 1, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      <div className="mt-1 mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[32px] gap-1">
        {Array.from({ length: totalCalendarCells }).map((_, index) => {
          const day = index - startOffset + 1
          const date = new Date(year, monthIndex, day)
          const dateKey = toDateKey(date)
          const isCurrentMonth = date.getMonth() === monthIndex
          const marker = markerMap.get(dateKey)
          const isSelected = selected && toDateKey(selected) === dateKey
          const isToday = toDateKey(new Date()) === dateKey

          return (
            <button
              key={dateKey}
              type="button"
              className={cn(
                "relative flex h-8 w-full items-center justify-center rounded-lg border border-transparent bg-white/70 text-sm font-semibold text-foreground/80 transition-colors hover:border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-100/85 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40",
                !isCurrentMonth &&
                  "text-muted-foreground/60 dark:text-emerald-100/40",
                isToday &&
                  !isSelected &&
                  "border-dashed border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-200",
                isSelected &&
                  "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-700 dark:border-emerald-300 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200",
                marker === "revenue" &&
                  !isSelected &&
                  "bg-emerald-50/60 dark:bg-emerald-950/30",
                marker === "expense" &&
                  !isSelected &&
                  "bg-rose-50/60 dark:bg-rose-950/30",
                marker === "both" &&
                  !isSelected &&
                  "bg-slate-50/80 dark:bg-slate-900/30"
              )}
              onClick={() => onSelect?.(date)}
            >
              <span>{date.getDate()}</span>
              {marker ? (
                <span
                  className={cn(
                    "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                    marker === "revenue" && "bg-emerald-500",
                    marker === "expense" && "bg-rose-500",
                    marker === "both" &&
                      "bg-[linear-gradient(135deg,#10b981_50%,#f43f5e_50%)]"
                  )}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-3 border-t border-border/70 pt-2">
        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Receita</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Despesa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#10b981_50%,#f43f5e_50%)]" />
            <span>Misto</span>
          </div>
        </div>
      </div>

    </div>
  )
}
