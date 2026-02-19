import type { SupabaseClient } from '@supabase/supabase-js'

export type RateMap = Record<string, Record<string, number>>
export type ExchangeRateData = { rates: RateMap; timestamp: string | null }

export async function fetchAndStoreExchangeRates(supabase: SupabaseClient): Promise<boolean> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?base=EUR&symbols=USD,PLN')
    if (!res.ok) return false

    const data = await res.json()
    const eurUsd: number = data?.rates?.USD
    const eurPln: number = data?.rates?.PLN
    if (!eurUsd || !eurPln) return false

    const timestamp = new Date().toISOString()
    const rows = [
      { base_currency: 'EUR', target_currency: 'USD', rate: eurUsd, timestamp },
      { base_currency: 'EUR', target_currency: 'PLN', rate: eurPln, timestamp },
      { base_currency: 'USD', target_currency: 'EUR', rate: 1 / eurUsd, timestamp },
      { base_currency: 'PLN', target_currency: 'EUR', rate: 1 / eurPln, timestamp },
      { base_currency: 'USD', target_currency: 'PLN', rate: eurPln / eurUsd, timestamp },
      { base_currency: 'PLN', target_currency: 'USD', rate: eurUsd / eurPln, timestamp },
    ]

    const { error } = await supabase.from('exchange_rates').insert(rows)
    if (error) return false

    return true
  } catch {
    return false
  }
}

export async function getLatestExchangeRates(supabase: SupabaseClient): Promise<ExchangeRateData> {
  const { data } = await supabase
    .from('exchange_rates')
    .select('base_currency, target_currency, rate, timestamp')
    .order('timestamp', { ascending: false })
    .limit(30)

  if (!data || data.length === 0) {
    return { rates: {}, timestamp: null }
  }

  const rates: RateMap = {}
  let latestTimestamp: string | null = null
  const seen = new Set<string>()

  for (const row of data) {
    const key = `${row.base_currency}:${row.target_currency}`
    if (seen.has(key)) continue
    seen.add(key)

    if (!rates[row.base_currency]) rates[row.base_currency] = {}
    rates[row.base_currency][row.target_currency] = row.rate

    if (!latestTimestamp || row.timestamp > latestTimestamp) {
      latestTimestamp = row.timestamp
    }
  }

  return { rates, timestamp: latestTimestamp }
}
