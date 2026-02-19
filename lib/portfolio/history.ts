import type { RateMap } from '@/lib/market-data/exchange-rates'
import { convertCurrency } from './calculations'

export type PortfolioValuePoint = { date: string; value: number }

type TxForHistory = {
  stock_symbol: string
  transaction_type: 'buy' | 'sell'
  quantity: number
  price: number
  currency: string
  transaction_date: string // ISO timestamp — slice to YYYY-MM-DD
}

type DailyPrice = { date: string; price: number } // date = YYYY-MM-DD, sorted ascending

type CashBalance = { currency: string; balance: number }

export function computePortfolioHistory(
  transactions: TxForHistory[],
  symbolPrices: Map<string, DailyPrice[]>, // each array sorted ascending by date
  rates: RateMap,
  displayCurrency: string,
  cashBalances: CashBalance[]
): PortfolioValuePoint[] {
  // Collect all unique trading dates across all symbols
  const allDatesSet = new Set<string>()
  for (const prices of symbolPrices.values()) {
    for (const p of prices) allDatesSet.add(p.date)
  }

  const sortedDates = [...allDatesSet].sort()
  if (sortedDates.length === 0) return []

  // Build forward-filled price map: symbol → date → price
  // For each trading date, carry forward the last known price per symbol
  const priceAtDate = new Map<string, Map<string, number>>()

  for (const [symbol, prices] of symbolPrices.entries()) {
    const dateMap = new Map<string, number>()
    let pIdx = 0
    let lastPrice: number | null = null

    for (const date of sortedDates) {
      while (pIdx < prices.length && prices[pIdx].date <= date) {
        lastPrice = prices[pIdx].price
        pIdx++
      }
      if (lastPrice !== null) dateMap.set(date, lastPrice)
    }
    priceAtDate.set(symbol, dateMap)
  }

  // Cash value is constant across all dates (no historical cash data)
  const cashValue = cashBalances.reduce((sum, c) => {
    if (c.balance <= 0) return sum
    return sum + convertCurrency(c.balance, c.currency, displayCurrency, rates)
  }, 0)

  // Sort transactions ascending by date for efficient filtering
  const sortedTx = [...transactions].sort((a, b) =>
    a.transaction_date.localeCompare(b.transaction_date)
  )

  const result: PortfolioValuePoint[] = []

  for (const date of sortedDates) {
    // Only count transactions on or before this date
    const txToDate = sortedTx.filter((t) => t.transaction_date.slice(0, 10) <= date)

    // Net quantity per symbol
    const netQty = new Map<string, number>()
    for (const tx of txToDate) {
      const cur = netQty.get(tx.stock_symbol) ?? 0
      netQty.set(
        tx.stock_symbol,
        tx.transaction_type === 'buy' ? cur + tx.quantity : cur - tx.quantity
      )
    }

    // Equity value: sum of positions valued at forward-filled price
    let equityValue = 0
    for (const [symbol, qty] of netQty.entries()) {
      if (qty <= 0) continue
      const price = priceAtDate.get(symbol)?.get(date)
      if (price !== undefined) {
        equityValue += convertCurrency(qty * price, 'USD', displayCurrency, rates)
      }
    }

    result.push({ date, value: equityValue + cashValue })
  }

  return result
}
