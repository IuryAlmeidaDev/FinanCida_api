import { NextResponse } from "next/server"

import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"

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

function mapHistory(prices: [number, number][]) {
  return prices
    .filter((_, index) => index % 15 === 0)
    .map(([timestamp, value]) => ({
      date: new Date(timestamp).toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
      value: Number(value.toFixed(2)),
    }))
}

export async function GET(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  const user = await getAuthUserFromToken(token)

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
  }

  const [pricesResponse, historyResponse] = await Promise.all([
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true",
      { cache: "no-store" }
    ),
    fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily",
      { cache: "no-store" }
    ),
  ])

  if (!pricesResponse.ok || !historyResponse.ok) {
    return NextResponse.json(
      { error: "Nao foi possivel carregar as criptomoedas." },
      { status: 502 }
    )
  }

  const prices = (await pricesResponse.json()) as SimplePriceResponse
  const history = (await historyResponse.json()) as MarketChartResponse

  return NextResponse.json({
    prices: [
      {
        name: "Bitcoin",
        symbol: "BTC",
        price: prices.bitcoin?.usd ?? 0,
        change24h: prices.bitcoin?.usd_24h_change ?? 0,
      },
      {
        name: "Ethereum",
        symbol: "ETH",
        price: prices.ethereum?.usd ?? 0,
        change24h: prices.ethereum?.usd_24h_change ?? 0,
      },
      {
        name: "Solana",
        symbol: "SOL",
        price: prices.solana?.usd ?? 0,
        change24h: prices.solana?.usd_24h_change ?? 0,
      },
    ],
    bitcoinHistory: mapHistory(history.prices),
  })
}
