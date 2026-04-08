"use client"

import * as React from "react"
import { BitcoinIcon } from "lucide-react"
import { Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type CryptoPayload = {
  prices: Array<{
    name: string
    symbol: string
    price: number
    change24h: number
  }>
  bitcoinHistory: Array<{
    date: string
    value: number
  }>
}

const bitcoinConfig = {
  value: {
    label: "Bitcoin",
    color: "#f59e0b",
  },
} satisfies ChartConfig

const dollarFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function CryptoDashboard() {
  const [payload, setPayload] = React.useState<CryptoPayload | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignore = false

    async function loadCrypto() {
      const response = await fetch("/api/crypto", { cache: "no-store" })

      if (!response.ok) {
        setError("Nao foi possivel carregar os dados de criptomoedas.")
        return
      }

      const nextPayload = (await response.json()) as CryptoPayload

      if (!ignore) {
        setPayload(nextPayload)
      }
    }

    loadCrypto()

    const interval = window.setInterval(loadCrypto, 60000)

    return () => {
      ignore = true
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div className="grid gap-4 px-4 py-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        {(payload?.prices ?? []).map((crypto) => (
          <Card key={crypto.symbol} className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BitcoinIcon className="size-4 text-amber-500" />
                {crypto.name}
              </CardTitle>
              <CardDescription>{crypto.symbol}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {dollarFormatter.format(crypto.price)}
              </p>
              <p
                className={
                  crypto.change24h >= 0
                    ? "text-sm font-medium text-emerald-700"
                    : "text-sm font-medium text-red-700"
                }
              >
                {crypto.change24h.toFixed(2)}% em 24h
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Bitcoin no ultimo ano</CardTitle>
          <CardDescription>
            Historico em USD atualizado pela CoinGecko.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : (
            <ChartContainer config={bitcoinConfig} className="h-[320px] w-full">
              <LineChart accessibilityLayer data={payload?.bitcoinHistory ?? []}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
