import type { RateMap } from '@/lib/market-data/exchange-rates'
import type { StockPriceMap } from '@/lib/market-data/stock-prices'

export type Position = {
  symbol: string
  netQuantity: number
  avgCostUSD: number
  currentPriceUSD: number | null
  currentValueUSD: number | null
  plUSD: number | null
  plPercent: number | null
  priceTimestamp: string | null
}

type Transaction = {
  stock_symbol: string
  transaction_type: 'buy' | 'sell'
  quantity: number
  price: number
  currency: string
}

type CashBalance = {
  currency: string
  balance: number
}

export function convertCurrency(amount: number, from: string, to: string, rates: RateMap): number {
  if (from === to) return amount
  return amount * (rates[from]?.[to] ?? 1)
}

export function computePositions(
  transactions: Transaction[],
  stockPrices: StockPriceMap,
  rates: RateMap
): Position[] {
  const groups: Record<string, Transaction[]> = {}
  for (const tx of transactions) {
    if (!groups[tx.stock_symbol]) groups[tx.stock_symbol] = []
    groups[tx.stock_symbol].push(tx)
  }

  const positions: Position[] = []

  for (const [symbol, txs] of Object.entries(groups)) {
    const buys = txs.filter((t) => t.transaction_type === 'buy')
    const sells = txs.filter((t) => t.transaction_type === 'sell')

    const totalBuyQty = buys.reduce((sum, t) => sum + t.quantity, 0)
    const totalSellQty = sells.reduce((sum, t) => sum + t.quantity, 0)
    const netQuantity = totalBuyQty - totalSellQty

    if (netQuantity <= 0) continue

    const totalCostUSD = buys.reduce(
      (sum, t) => sum + t.quantity * convertCurrency(t.price, t.currency, 'USD', rates),
      0
    )
    const avgCostUSD = totalBuyQty > 0 ? totalCostUSD / totalBuyQty : 0

    const priceData = stockPrices[symbol]
    const currentPriceUSD = priceData?.price ?? null
    const currentValueUSD = currentPriceUSD !== null ? currentPriceUSD * netQuantity : null
    const plUSD =
      currentPriceUSD !== null ? (currentPriceUSD - avgCostUSD) * netQuantity : null
    const plPercent =
      plUSD !== null && avgCostUSD > 0 ? (plUSD / (avgCostUSD * netQuantity)) * 100 : null

    positions.push({
      symbol,
      netQuantity,
      avgCostUSD,
      currentPriceUSD,
      currentValueUSD,
      plUSD,
      plPercent,
      priceTimestamp: priceData?.timestamp ?? null,
    })
  }

  return positions
}

export function computeTotalValue(
  positions: Position[],
  cashBalances: CashBalance[],
  displayCurrency: string,
  rates: RateMap
): number {
  let total = 0

  for (const pos of positions) {
    if (pos.currentValueUSD !== null) {
      total += convertCurrency(pos.currentValueUSD, 'USD', displayCurrency, rates)
    }
  }

  for (const cash of cashBalances) {
    if (cash.balance > 0) {
      total += convertCurrency(cash.balance, cash.currency, displayCurrency, rates)
    }
  }

  return total
}
