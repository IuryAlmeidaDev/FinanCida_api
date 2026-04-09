const currencyInputFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function sanitizeCurrencyDigits(value: string) {
  return value.replace(/\D/g, "")
}

export function formatCurrencyInput(value: string | number) {
  const digits =
    typeof value === "number"
      ? Math.round(Math.max(value, 0) * 100).toString()
      : sanitizeCurrencyDigits(value)

  const amount = Number(digits || "0") / 100

  return currencyInputFormatter.format(amount)
}

export function parseCurrencyInput(value: string) {
  return Number(sanitizeCurrencyDigits(value) || "0") / 100
}

export function formatBrazilianDate(date: Date) {
  return date.toLocaleDateString("pt-BR")
}

export function formatIsoDateToBrazilian(date: string) {
  if (!date) {
    return ""
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR")
}
