import type { SupabaseClient } from '@supabase/supabase-js'

export type PricePoint = { date: string; price: number }
// date = "YYYY-MM-DD" (X axis label), price = daily close USD

export async function fetchAndStoreDailyPrices(
  supabase: SupabaseClient,
  symbol: string
): Promise<boolean> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return false

  // Skip API call if we already fetched daily closes today or yesterday
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const { data: freshCheck } = await supabase
    .from('stock_prices')
    .select('timestamp')
    .eq('stock_symbol', symbol)
    .in('timestamp', [`${today}T00:00:00+00:00`, `${yesterday}T00:00:00+00:00`])
    .limit(1)
  if (freshCheck && freshCheck.length > 0) return true

  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) return false

    const data = await res.json()
    const timeSeries = data?.['Time Series (Daily)']
    if (!timeSeries || typeof timeSeries !== 'object') return false

    const apiDates = Object.keys(timeSeries)
    if (apiDates.length === 0) return false

    const apiTimestamps = apiDates.map((d) => d + 'T00:00:00+00:00')

    const { data: existing } = await supabase
      .from('stock_prices')
      .select('timestamp')
      .eq('stock_symbol', symbol)
      .in('timestamp', apiTimestamps)

    const existingSet = new Set((existing ?? []).map((r) => r.timestamp))

    const newRows = apiDates
      .filter((d) => !existingSet.has(d + 'T00:00:00+00:00'))
      .map((d) => ({
        stock_symbol: symbol,
        price: parseFloat(timeSeries[d]['4. close']),
        timestamp: d + 'T00:00:00+00:00',
      }))
      .filter((r) => !isNaN(r.price))

    if (newRows.length === 0) return true

    const { error } = await supabase.from('stock_prices').insert(newRows)
    if (error) return false

    return true
  } catch {
    return false
  }
}

export async function getDailyPriceHistory(
  supabase: SupabaseClient,
  symbol: string,
  days: number
): Promise<PricePoint[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('stock_prices')
    .select('timestamp, price')
    .eq('stock_symbol', symbol)
    .gte('timestamp', since)
    .order('timestamp', { ascending: true })

  if (!data || data.length === 0) return []

  // Deduplicate by calendar date — ASC order means later rows overwrite earlier same-date entries
  const byDate = new Map<string, number>()
  for (const row of data) {
    const date = row.timestamp.slice(0, 10)
    byDate.set(date, row.price)
  }

  return Array.from(byDate.entries()).map(([date, price]) => ({ date, price }))
}

export async function getDailyPricesForSymbols(
  supabase: SupabaseClient,
  symbols: string[],
  days: number
): Promise<Map<string, PricePoint[]>> {
  if (symbols.length === 0) return new Map()

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('stock_prices')
    .select('stock_symbol, timestamp, price')
    .in('stock_symbol', symbols)
    .gte('timestamp', since)
    .order('timestamp', { ascending: true })

  if (!data || data.length === 0) return new Map()

  // Group by symbol, deduplicate by calendar date (later timestamp wins = real-time overrides daily close)
  const bySymbol = new Map<string, Map<string, number>>()
  for (const row of data) {
    const date = row.timestamp.slice(0, 10)
    if (!bySymbol.has(row.stock_symbol)) bySymbol.set(row.stock_symbol, new Map())
    bySymbol.get(row.stock_symbol)!.set(date, row.price)
  }

  const result = new Map<string, PricePoint[]>()
  for (const [symbol, dateMap] of bySymbol.entries()) {
    result.set(
      symbol,
      Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, price]) => ({ date, price }))
    )
  }
  return result
}
