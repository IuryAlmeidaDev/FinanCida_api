import { NextResponse } from "next/server"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import {
  mapBitcoinHistoryToBrl,
  mapCryptoPriceToBrl,
  type ExchangeRatePayload,
} from "@/lib/crypto-conversion"

export const runtime = "nodejs"

type MarketChartResponse = {
  prices: [number, number][]
}

type SimplePriceResponse = {
  bitcoin?: {
    usd?: number
    usd_24h_change?: number
  }
  ethereum?: {
    usd?: number
    usd_24h_change?: number
  }
  solana?: {
    usd?: number
    usd_24h_change?: number
  }
}

export async function GET(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  const user = await getAuthUserFromToken(token)

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
  }

  const [pricesResponse, historyResponse, exchangeRateResponse] = await Promise.all([
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true",
      { cache: "no-store" }
    ),
    fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily",
      { cache: "no-store" }
    ),
    fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" }),
  ])

  if (!pricesResponse.ok || !historyResponse.ok || !exchangeRateResponse.ok) {
    return NextResponse.json(
      { error: "Nao foi possivel carregar as criptomoedas." },
      { status: 502 }
    )
  }

  const prices = (await pricesResponse.json()) as SimplePriceResponse
  const history = (await historyResponse.json()) as MarketChartResponse
  const exchangeRate = (await exchangeRateResponse.json()) as ExchangeRatePayload
  const usdToBrlRate = exchangeRate.rates?.BRL ?? 5

  return NextResponse.json({
    prices: [
      mapCryptoPriceToBrl({
        name: "Bitcoin",
        symbol: "BTC",
        priceUsd: prices.bitcoin?.usd ?? 0,
        change24h: prices.bitcoin?.usd_24h_change ?? 0,
        usdToBrlRate,
      }),
      mapCryptoPriceToBrl({
        name: "Ethereum",
        symbol: "ETH",
        priceUsd: prices.ethereum?.usd ?? 0,
        change24h: prices.ethereum?.usd_24h_change ?? 0,
        usdToBrlRate,
      }),
      mapCryptoPriceToBrl({
        name: "Solana",
        symbol: "SOL",
        priceUsd: prices.solana?.usd ?? 0,
        change24h: prices.solana?.usd_24h_change ?? 0,
        usdToBrlRate,
      }),
    ],
    bitcoinHistory: mapBitcoinHistoryToBrl(history.prices, usdToBrlRate),
    usdToBrlRate,
  })
}
