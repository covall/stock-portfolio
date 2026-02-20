import { createClient } from 'npm:@supabase/supabase-js@2'

type SummaryType = 'daily' | 'weekly' | 'monthly'

const PERIOD_DAYS: Record<SummaryType, number> = { daily: 1, weekly: 7, monthly: 30 }
const PERIOD_LABEL: Record<SummaryType, string> = {
  daily: 'last trading day',
  weekly: 'last 7 days',
  monthly: 'last 30 days',
}

// ---------------------------------------------------------------------------
// Inline portfolio helpers (mirrors lib/portfolio/calculations.ts logic)
// ---------------------------------------------------------------------------

type RateMap = Record<string, Record<string, number>>

function convertToUSD(amount: number, currency: string, rates: RateMap): number {
  if (currency === 'USD') return amount
  return amount * (rates[currency]?.['USD'] ?? 1)
}

type Tx = {
  stock_symbol: string
  transaction_type: string
  quantity: number
  price: number
  currency: string
}

type PriceRow = { stock_symbol: string; price: number; timestamp: string }

function computePositions(
  transactions: Tx[],
  latestPrices: Record<string, number>,
  rates: RateMap
) {
  const groups: Record<string, Tx[]> = {}
  for (const tx of transactions) {
    if (!groups[tx.stock_symbol]) groups[tx.stock_symbol] = []
    groups[tx.stock_symbol].push(tx)
  }

  return Object.entries(groups)
    .map(([symbol, txs]) => {
      const buys = txs.filter((t) => t.transaction_type === 'buy')
      const sells = txs.filter((t) => t.transaction_type === 'sell')
      const netQty =
        buys.reduce((s, t) => s + t.quantity, 0) - sells.reduce((s, t) => s + t.quantity, 0)
      if (netQty <= 0) return null

      const totalBuyQty = buys.reduce((s, t) => s + t.quantity, 0)
      const totalCostUSD = buys.reduce(
        (s, t) => s + t.quantity * convertToUSD(t.price, t.currency, rates),
        0
      )
      const avgCostUSD = totalBuyQty > 0 ? totalCostUSD / totalBuyQty : 0
      const currentPrice = latestPrices[symbol] ?? null
      const currentValueUSD = currentPrice !== null ? currentPrice * netQty : null
      const plUSD = currentPrice !== null ? (currentPrice - avgCostUSD) * netQty : null
      const plPercent =
        plUSD !== null && avgCostUSD > 0 ? (plUSD / (avgCostUSD * netQty)) * 100 : null

      return { symbol, netQty, avgCostUSD, currentPrice, currentValueUSD, plUSD, plPercent }
    })
    .filter(Boolean)
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function fmtChange(n: number): string {
  return `${n >= 0 ? '+' : ''}$${fmt(Math.abs(n))} (${n >= 0 ? '+' : ''}${fmt((n / 100) * 100, 1)}%)`
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  // --- Security: validate shared secret ---
  const secret = Deno.env.get('SUMMARY_SECRET')
  if (secret && req.headers.get('X-Summary-Secret') !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // --- Parse request body ---
  let summaryType: SummaryType = 'daily'
  try {
    const body = await req.json()
    if (body.type === 'weekly' || body.type === 'monthly') summaryType = body.type
  } catch {
    // default to daily
  }

  const periodDays = PERIOD_DAYS[summaryType]
  const periodLabel = PERIOD_LABEL[summaryType]
  const today = new Date().toISOString().slice(0, 10)
  const periodStartDate = new Date(Date.now() - periodDays * 86400000).toISOString().slice(0, 10)

  // --- Supabase admin client (bypasses RLS) ---
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // --- Get all users ---
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError || !usersData) {
    return new Response(JSON.stringify({ error: 'Failed to list users' }), { status: 500 })
  }

  const users = usersData.users.filter((u) => u.email)
  let processed = 0

  for (const user of users) {
    try {
      await processUser(supabase, user.id, user.email!, summaryType, periodDays, periodLabel, today, periodStartDate)
      processed++
    } catch (err) {
      console.error(`Failed to process user ${user.id}:`, err)
    }
  }

  return new Response(
    JSON.stringify({ success: true, usersProcessed: processed, type: summaryType }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})

// ---------------------------------------------------------------------------
// Per-user summary
// ---------------------------------------------------------------------------

async function processUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  summaryType: SummaryType,
  periodDays: number,
  periodLabel: string,
  today: string,
  periodStartDate: string
) {
  // Fetch all user data in parallel
  const [{ data: txRows }, { data: cashRows }, { data: priceRows }, { data: rateRows }] =
    await Promise.all([
      supabase
        .from('transactions')
        .select('stock_symbol, transaction_type, quantity, price, currency')
        .eq('user_id', userId),
      supabase
        .from('cash_balances')
        .select('currency, balance')
        .eq('user_id', userId),
      supabase
        .from('stock_prices')
        .select('stock_symbol, price, timestamp')
        .order('timestamp', { ascending: false })
        .limit(500),
      supabase
        .from('exchange_rates')
        .select('base_currency, target_currency, rate')
        .order('timestamp', { ascending: false })
        .limit(30),
    ])

  const transactions = (txRows ?? []).map((t) => ({
    ...t,
    quantity: Number(t.quantity),
    price: Number(t.price),
  })) as Tx[]

  const cashBalances = (cashRows ?? []).map((r) => ({
    currency: r.currency as string,
    balance: Number(r.balance),
  }))

  if (transactions.length === 0 && cashBalances.every((c) => c.balance === 0)) return

  // Build rate map
  const rates: RateMap = {}
  const seenRates = new Set<string>()
  for (const row of rateRows ?? []) {
    const key = `${row.base_currency}:${row.target_currency}`
    if (seenRates.has(key)) continue
    seenRates.add(key)
    if (!rates[row.base_currency]) rates[row.base_currency] = {}
    rates[row.base_currency][row.target_currency] = row.rate
  }

  // Build latest price map per symbol (most recent timestamp)
  const latestPrices: Record<string, number> = {}
  const seenSymbols = new Set<string>()
  for (const row of (priceRows ?? []) as PriceRow[]) {
    if (seenSymbols.has(row.stock_symbol)) continue
    seenSymbols.add(row.stock_symbol)
    latestPrices[row.stock_symbol] = row.price
  }

  // Build historical price map for period start
  // Find the most recent price for each symbol on or before periodStartDate
  const historicalPrices: Record<string, number> = {}
  for (const symbol of Object.keys(latestPrices)) {
    const histRow = ((priceRows ?? []) as PriceRow[])
      .filter((r) => r.stock_symbol === symbol && r.timestamp.slice(0, 10) <= periodStartDate)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
    if (histRow) historicalPrices[symbol] = histRow.price
  }

  // Compute positions
  const positions = computePositions(transactions, latestPrices, rates)

  // Total current equity value (USD)
  const currentEquityUSD = positions.reduce((s, p) => s + (p?.currentValueUSD ?? 0), 0)

  // Historical equity value using period-start prices, same positions
  const historicalEquityUSD = positions.reduce((s, p) => {
    if (!p) return s
    const histPrice = historicalPrices[p.symbol]
    if (histPrice === undefined) return s + (p.currentValueUSD ?? 0) // no history → use current
    return s + histPrice * p.netQty
  }, 0)

  const cashUSD = cashBalances.reduce((s, c) => s + convertToUSD(c.balance, c.currency, rates), 0)
  const currentTotalUSD = currentEquityUSD + cashUSD
  const historicalTotalUSD = historicalEquityUSD + cashUSD
  const periodChangeUSD = currentTotalUSD - historicalTotalUSD
  const periodChangePct =
    historicalTotalUSD > 0 ? (periodChangeUSD / historicalTotalUSD) * 100 : 0

  // Build positions text for prompt
  const positionsText = positions
    .filter((p) => p && p.currentValueUSD !== null)
    .map((p) => {
      const dayPriceChange =
        p!.currentPrice !== null && historicalPrices[p!.symbol] !== undefined
          ? p!.currentPrice - historicalPrices[p!.symbol]
          : null
      const dayPctChange =
        dayPriceChange !== null && historicalPrices[p!.symbol] > 0
          ? (dayPriceChange / historicalPrices[p!.symbol]) * 100
          : null

      return [
        `${p!.symbol}: ${fmt(p!.netQty, 4)} shares`,
        `avg cost $${fmt(p!.avgCostUSD)}`,
        `current $${fmt(p!.currentPrice ?? 0)}`,
        `value $${fmt(p!.currentValueUSD ?? 0)}`,
        p!.plUSD !== null ? `P/L ${p!.plUSD >= 0 ? '+' : ''}$${fmt(p!.plUSD)} (${p!.plPercent !== null ? `${p!.plPercent >= 0 ? '+' : ''}${fmt(p!.plPercent, 1)}%` : 'N/A'})` : '',
        dayPctChange !== null
          ? `period price change: ${dayPctChange >= 0 ? '+' : ''}${fmt(dayPctChange, 1)}%`
          : '',
      ]
        .filter(Boolean)
        .join(' | ')
    })
    .join('\n')

  const cashText = cashBalances
    .filter((c) => c.balance > 0)
    .map((c) => {
      const sym = c.currency === 'USD' ? '$' : c.currency === 'EUR' ? '€' : ''
      return `${c.currency} ${sym}${fmt(c.balance)}`
    })
    .join(' | ')

  const prompt = `You are a financial portfolio assistant. Write a concise ${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Portfolio Summary email for an investor.

Date: ${today}
Period: ${periodLabel}

PORTFOLIO SNAPSHOT:
Total value: $${fmt(currentTotalUSD)} USD
Period change: ${periodChangeUSD >= 0 ? '+' : ''}$${fmt(Math.abs(periodChangeUSD))} (${periodChangePct >= 0 ? '+' : ''}${fmt(periodChangePct, 1)}%) vs ${periodStartDate}

POSITIONS:
${positionsText || 'No open positions.'}

CASH: ${cashText || 'No cash balances.'}

Write 150-200 words. Be factual, professional, and concise. Start with a subject line on the first line prefixed exactly "Subject: " (e.g. "Subject: Daily Summary — Portfolio +1.2%"). The rest is the email body.`

  // Call Openrouter.ai
  const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': Deno.env.get('SUPABASE_URL') ?? 'https://stock-portfolio.app',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-haiku-4-5',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    }),
  })

  if (!aiRes.ok) {
    console.error('Openrouter error:', await aiRes.text())
    return
  }

  const aiJson = await aiRes.json()
  const rawText: string = aiJson.choices?.[0]?.message?.content ?? ''

  // Parse Subject line from first line
  const lines = rawText.trim().split('\n')
  let subject = `${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Portfolio Summary — ${today}`
  let bodyText = rawText
  if (lines[0].startsWith('Subject: ')) {
    subject = lines[0].replace('Subject: ', '').trim()
    bodyText = lines.slice(1).join('\n').trim()
  }

  // Send via Resend
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Portfolio Tracker <onboarding@resend.dev>',
      to: [email],
      subject,
      html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#1e293b;margin-bottom:16px">${subject}</h2>
        <div style="color:#334155;line-height:1.7;white-space:pre-wrap">${bodyText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0"/>
        <p style="color:#94a3b8;font-size:12px">Stock Portfolio Tracker · Automated ${summaryType} summary</p>
      </div>`,
    }),
  })

  if (!emailRes.ok) {
    console.error('Resend error:', await emailRes.text())
  }
}
