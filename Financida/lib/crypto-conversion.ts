export type ExchangeRatePayload = {
  rates?: {
    BRL?: number
  }
}

export function convertUsdToBrl(valueInUsd: number, usdToBrlRate: number) {
  return Number((valueInUsd * usdToBrlRate).toFixed(2))
}

export function mapCryptoPriceToBrl(input: {
  name: string
  symbol: string
  priceUsd: number
  change24h: number
  usdToBrlRate: number
}) {
  return {
    name: input.name,
    symbol: input.symbol,
    priceUsd: input.priceUsd,
    priceBrl: convertUsdToBrl(input.priceUsd, input.usdToBrlRate),
    change24h: input.change24h,
  }
}

export function mapBitcoinHistoryToBrl(
  prices: [number, number][],
  usdToBrlRate: number
) {
  return prices
    .filter((_, index) => index % 15 === 0)
    .map(([timestamp, value]) => ({
      date: new Date(timestamp).toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
      valueUsd: Number(value.toFixed(2)),
      valueBrl: convertUsdToBrl(value, usdToBrlRate),
    }))
}
