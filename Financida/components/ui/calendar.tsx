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
    <div className={cn("rounded-xl border bg-card p-3", className)}>
      <div className="mb-3 text-center text-sm font-medium capitalize">
        {visibleMonth.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
          <div key={`${day}-${index}`} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
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
                "relative flex aspect-square items-center justify-center rounded-lg bg-white text-sm text-black transition-colors hover:bg-white",
                isSelected && "border border-black bg-white text-black hover:bg-white",
                marker && !isSelected && "border border-black bg-white text-black"
              )}
              onClick={() => onSelect?.(date)}
            >
              {day}
              {marker && (
                <span
                  className={cn(
                    "absolute bottom-1 size-1.5 rounded-full",
                    "bg-black"
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
