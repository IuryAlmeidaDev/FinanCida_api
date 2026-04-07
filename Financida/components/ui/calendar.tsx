"use client"

import * as React from "react"

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
  const visibleMonth = month ?? selected ?? new Date()
  const year = visibleMonth.getFullYear()
  const monthIndex = visibleMonth.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const startOffset = firstDay.getDay()
  const markerMap = new Map(markers.map((marker) => [marker.date, marker.type]))

  return (
    <div
      className={cn(
        "rounded-3xl bg-card p-5 shadow-lg shadow-emerald-950/5 ring-1 ring-emerald-100 dark:shadow-black/30 dark:ring-emerald-900/60",
        className
      )}
    >
      <div className="mb-4 text-center text-base font-semibold capitalize text-foreground">
        {visibleMonth.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
          <div key={`${day}-${index}`} className="py-1">
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

          return (
            <button
              key={dateKey}
              type="button"
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-2xl bg-background text-sm font-medium text-foreground transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
                isSelected && "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200",
                marker === "revenue" && !isSelected && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
                marker === "expense" && !isSelected && "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200",
                marker === "both" && !isSelected && "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
              )}
              onClick={() => onSelect?.(date)}
            >
              {day}
              {marker && (
                <span
                  className={cn(
                    "absolute bottom-1 size-1.5 rounded-full",
                    marker === "revenue" && "bg-emerald-500",
                    marker === "expense" && "bg-red-500",
                    marker === "both" && "bg-sky-500"
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
