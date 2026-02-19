import type { SupabaseClient } from '@supabase/supabase-js'

export type PricePoint = { date: string; price: number }
// date = "YYYY-MM-DD" (X axis label), price = daily close USD

export async function fetchAndStoreDailyPrices(
  supabase: SupabaseClient,
  symbol: string
): Promise<boolean> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return false

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
