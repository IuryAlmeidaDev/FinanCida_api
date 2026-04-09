"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/formatters"

export function CurrencyInput({
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string
  onValueChange: (maskedValue: string, numericValue: number) => void
}) {
  return (
    <Input
      inputMode="numeric"
      value={value}
      onChange={(event) => {
        const maskedValue = formatCurrencyInput(event.target.value)
        onValueChange(maskedValue, parseCurrencyInput(maskedValue))
      }}
      {...props}
    />
  )
}
