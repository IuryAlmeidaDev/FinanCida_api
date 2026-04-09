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
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const startOffset = firstDay.getDay()
  const markerMap = new Map(markers.map((marker) => [marker.date, marker.type]))

  return (
    <div
      className={cn(
        "rounded-[28px] bg-gradient-to-br from-white via-emerald-50/30 to-slate-50 p-5 shadow-lg shadow-emerald-950/5 ring-1 ring-emerald-100 dark:from-emerald-950/20 dark:via-card dark:to-card dark:shadow-black/30 dark:ring-emerald-900/60",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full border border-emerald-100 bg-white/80 text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-950/50"
          onClick={() => setVisibleMonth(new Date(year, monthIndex - 1, 1))}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <div className="text-center text-base font-semibold capitalize text-foreground">
          {visibleMonth.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full border border-emerald-100 bg-white/80 text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-950/50"
          onClick={() => setVisibleMonth(new Date(year, monthIndex + 1, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startOffset }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const date = new Date(year, monthIndex, day)
          const dateKey = toDateKey(date)
          const marker = markerMap.get(dateKey)
          const isSelected = selected && toDateKey(selected) === dateKey
          const isToday = toDateKey(new Date()) === dateKey

          return (
            <button
              key={dateKey}
              type="button"
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-2xl border border-transparent bg-white/70 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40",
                isToday &&
                  !isSelected &&
                  "border-dashed border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-200",
                isSelected &&
                  "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-700 dark:border-emerald-300 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200",
                marker === "revenue" &&
                  !isSelected &&
                  "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/60",
                marker === "expense" &&
                  !isSelected &&
                  "bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/60",
                marker === "both" &&
                  !isSelected &&
                  "bg-sky-50 text-sky-800 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-900/60"
              )}
              onClick={() => onSelect?.(date)}
            >
              {day}
              {marker && (
                <span
                  className={cn(
                    "absolute bottom-1.5 size-1.5 rounded-full",
                    isSelected && "bg-white dark:bg-emerald-950",
                    marker === "revenue" && !isSelected && "bg-emerald-500",
                    marker === "expense" && !isSelected && "bg-rose-500",
                    marker === "both" && !isSelected && "bg-sky-500"
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {[
          ["Receitas", "bg-emerald-500"],
          ["Despesas", "bg-rose-500"],
          ["Misto", "bg-sky-500"],
        ].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", color)} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
