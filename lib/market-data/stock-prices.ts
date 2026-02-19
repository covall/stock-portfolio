import type { SupabaseClient } from '@supabase/supabase-js'

export type StockPriceMap = Record<string, { price: number; timestamp: string } | null>

export async function fetchAndStoreStockPrices(
  supabase: SupabaseClient,
  symbols: string[]
): Promise<boolean> {
  if (symbols.length === 0) return true

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return false

  let allSucceeded = true

  for (const symbol of symbols) {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) {
        allSucceeded = false
        continue
      }

      const data = await res.json()
      const priceStr = data?.['Global Quote']?.['05. price']
      const price = parseFloat(priceStr)
      if (!priceStr || isNaN(price)) {
        allSucceeded = false
        continue
      }

      const timestamp = new Date().toISOString()
      const { error } = await supabase
        .from('stock_prices')
        .insert({ stock_symbol: symbol, price, timestamp })

      if (error) allSucceeded = false
    } catch {
      allSucceeded = false
    }
  }

  return allSucceeded
}

export async function getLatestStockPrices(
  supabase: SupabaseClient,
  symbols: string[]
): Promise<StockPriceMap> {
  if (symbols.length === 0) return {}

  const { data } = await supabase
    .from('stock_prices')
    .select('stock_symbol, price, timestamp')
    .in('stock_symbol', symbols)
    .order('timestamp', { ascending: false })
    .limit(symbols.length * 5)

  const result: StockPriceMap = {}
  for (const symbol of symbols) {
    result[symbol] = null
  }

  if (!data) return result

  const seen = new Set<string>()
  for (const row of data) {
    if (seen.has(row.stock_symbol)) continue
    seen.add(row.stock_symbol)
    result[row.stock_symbol] = { price: row.price, timestamp: row.timestamp }
  }

  return result
}
