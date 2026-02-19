import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAndStoreExchangeRates, getLatestExchangeRates } from '@/lib/market-data/exchange-rates'
import { fetchAndStoreStockPrices, getLatestStockPrices } from '@/lib/market-data/stock-prices'
import { computePositions, computeTotalValue, convertCurrency } from '@/lib/portfolio/calculations'

type DisplayCurrency = 'USD' | 'EUR' | 'PLN'
const CURRENCIES: DisplayCurrency[] = ['USD', 'EUR', 'PLN']
const CURRENCY_SYMBOLS: Record<DisplayCurrency, string> = { USD: '$', EUR: '€', PLN: 'zł' }

function fmt(n: number, currency: DisplayCurrency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  return `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const FX_DISPLAY_PAIRS: [string, string][] = [
  ['EUR', 'USD'],
  ['EUR', 'PLN'],
  ['USD', 'PLN'],
  ['PLN', 'USD'],
]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>
}) {
  const params = await searchParams
  const rawCurrency = params.currency?.toUpperCase()
  const displayCurrency: DisplayCurrency =
    rawCurrency === 'EUR' || rawCurrency === 'PLN' ? rawCurrency : 'USD'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: transactions }, { data: cashRows }] = await Promise.all([
    supabase
      .from('transactions')
      .select('stock_symbol, transaction_type, quantity, price, currency')
      .eq('user_id', user.id),
    supabase.from('cash_balances').select('currency, balance').eq('user_id', user.id),
  ])

  const txList = transactions ?? []
  const cashBalances = (cashRows ?? []).map((r) => ({
    currency: r.currency,
    balance: Number(r.balance),
  }))

  const hasAnyCash = cashBalances.some((c) => c.balance > 0)
  const isEmpty = txList.length === 0 && !hasAnyCash

  if (isEmpty) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>
        <div className='bg-gray-50 rounded-lg p-10 text-center'>
          <p className='text-gray-500 mb-6 text-lg'>Your portfolio is empty.</p>
          <div className='flex justify-center gap-4'>
            <Link
              href='/transactions/new'
              className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
            >
              Add Transaction
            </Link>
            <Link
              href='/cash'
              className='inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground'
            >
              Set Cash Balance
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const symbols = [...new Set(txList.map((t) => t.stock_symbol))]

  const [ratesRefreshed, pricesRefreshed] = await Promise.all([
    fetchAndStoreExchangeRates(supabase),
    fetchAndStoreStockPrices(supabase, symbols),
  ])

  const [{ rates, timestamp: ratesTimestamp }, stockPrices] = await Promise.all([
    getLatestExchangeRates(supabase),
    getLatestStockPrices(supabase, symbols),
  ])

  const staleRates = !ratesRefreshed
  const stalePrices =
    symbols.length > 0 &&
    (!pricesRefreshed || Object.values(stockPrices).some((p) => p === null))

  const positions = computePositions(txList, stockPrices, rates)
  const totalValue = computeTotalValue(positions, cashBalances, displayCurrency, rates)

  const equityValue = positions.reduce((sum, p) => {
    if (p.currentValueUSD === null) return sum
    return sum + convertCurrency(p.currentValueUSD, 'USD', displayCurrency, rates)
  }, 0)
  const cashValue = cashBalances.reduce((sum, c) => {
    if (c.balance <= 0) return sum
    return sum + convertCurrency(c.balance, c.currency, displayCurrency, rates)
  }, 0)
  const hasEquityValue = positions.some((p) => p.currentValueUSD !== null)

  const totalPL = positions.reduce((sum, p) => {
    if (p.plUSD === null) return sum
    return sum + convertCurrency(p.plUSD, 'USD', displayCurrency, rates)
  }, 0)
  const hasPLData = positions.some((p) => p.plUSD !== null)

  const hasApiKey = !!process.env.ALPHA_VANTAGE_API_KEY
  const ratesDate = ratesTimestamp
    ? new Date(ratesTimestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : null

  return (
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

      {/* Data status row */}
      <div className='mb-6 flex flex-wrap gap-3'>
        <StatusBadge
          ok={!staleRates}
          okLabel={`FX rates updated${ratesDate ? ` · ${ratesDate}` : ''}`}
          failLabel='FX rates could not refresh (Frankfurter API)'
        />
        {symbols.length > 0 && (
          <StatusBadge
            ok={!stalePrices}
            okLabel='Stock prices updated'
            failLabel={
              !hasApiKey
                ? 'Stock prices unavailable — set ALPHA_VANTAGE_API_KEY in .env.local'
                : 'Stock prices could not refresh — check ALPHA_VANTAGE_API_KEY (demo key only works for IBM)'
            }
          />
        )}
      </div>

      {/* Summary cards */}
      <div className='grid gap-4 md:grid-cols-3 mb-8'>
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold mb-1'>{fmt(totalValue, displayCurrency)}</p>
            <p className='text-sm text-gray-500 mb-4'>
              Equity:{' '}
              <span className='font-medium'>
                {hasEquityValue ? fmt(equityValue, displayCurrency) : 'N/A'}
              </span>
              {' · '}
              Cash:{' '}
              <span className='font-medium'>
                {hasAnyCash ? fmt(cashValue, displayCurrency) : 'N/A'}
              </span>
            </p>
            <div className='flex gap-2'>
              {CURRENCIES.map((c) => (
                <a
                  key={c}
                  href={`/?currency=${c}`}
                  className={`px-3 py-1 rounded text-sm font-medium border ${
                    c === displayCurrency
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-input hover:bg-accent'
                  }`}
                >
                  {c}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total P&amp;L</CardTitle>
          </CardHeader>
          <CardContent>
            {hasPLData ? (
              <p
                className={`text-3xl font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {totalPL >= 0 ? '+' : ''}
                {fmt(totalPL, displayCurrency)}
              </p>
            ) : (
              <p className='text-3xl font-bold text-gray-400'>N/A</p>
            )}
            {!hasPLData && (
              <p className='text-xs text-gray-400 mt-1'>Requires current stock prices</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exchange rates */}
      <section className='mb-8'>
        <h2 className='text-xl font-semibold mb-3'>
          Exchange Rates
          {ratesDate && (
            <span className='ml-2 text-sm font-normal text-gray-400'>as of {ratesDate}</span>
          )}
        </h2>
        {Object.keys(rates).length > 0 ? (
          <div className='flex flex-wrap gap-3'>
            {FX_DISPLAY_PAIRS.map(([from, to]) => {
              const rate = rates[from]?.[to]
              return (
                <div key={`${from}/${to}`} className='rounded-lg border bg-white px-4 py-3'>
                  <p className='text-xs text-gray-500 mb-0.5'>
                    {from}/{to}
                  </p>
                  <p className='text-base font-semibold'>
                    {rate !== undefined ? rate.toFixed(4) : 'N/A'}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className='text-sm text-gray-400'>
            No exchange rate data available — Frankfurter API may be unreachable.
          </p>
        )}
      </section>

      {/* Holdings */}
      {positions.length > 0 && (
        <section className='mb-8'>
          <h2 className='text-xl font-semibold mb-3'>Holdings</h2>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white rounded-lg overflow-hidden'>
              <thead className='bg-gray-100 text-gray-800'>
                <tr>
                  <th className='text-left py-3 px-4 font-semibold'>Symbol</th>
                  <th className='text-right py-3 px-4 font-semibold'>Qty</th>
                  <th className='text-right py-3 px-4 font-semibold'>Avg Cost (USD)</th>
                  <th className='text-right py-3 px-4 font-semibold'>Current Price</th>
                  <th className='text-right py-3 px-4 font-semibold'>
                    Value ({displayCurrency})
                  </th>
                  <th className='text-right py-3 px-4 font-semibold'>P/L $</th>
                  <th className='text-right py-3 px-4 font-semibold'>P/L %</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {positions.map((pos) => {
                  const valueInDisplay =
                    pos.currentValueUSD !== null
                      ? convertCurrency(pos.currentValueUSD, 'USD', displayCurrency, rates)
                      : null
                  return (
                    <tr key={pos.symbol} className='hover:bg-gray-50'>
                      <td className='py-3 px-4 font-medium'>
                        <Link href={`/stocks/${pos.symbol}`} className='hover:underline text-blue-600'>
                          {pos.symbol}
                        </Link>
                        {pos.priceTimestamp && (
                          <div className='text-xs text-gray-400'>
                            price:{' '}
                            {new Date(pos.priceTimestamp).toLocaleString('en-US', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </div>
                        )}
                      </td>
                      <td className='py-3 px-4 text-right'>{pos.netQuantity}</td>
                      <td className='py-3 px-4 text-right'>${pos.avgCostUSD.toFixed(2)}</td>
                      <td className='py-3 px-4 text-right'>
                        {pos.currentPriceUSD !== null ? `$${pos.currentPriceUSD.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className='py-3 px-4 text-right'>
                        {valueInDisplay !== null ? fmt(valueInDisplay, displayCurrency) : 'N/A'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          pos.plUSD === null
                            ? ''
                            : pos.plUSD >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                        }`}
                      >
                        {pos.plUSD !== null
                          ? `${pos.plUSD >= 0 ? '+' : ''}$${pos.plUSD.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          pos.plPercent === null
                            ? ''
                            : pos.plPercent >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                        }`}
                      >
                        {pos.plPercent !== null
                          ? `${pos.plPercent >= 0 ? '+' : ''}${pos.plPercent.toFixed(2)}%`
                          : 'N/A'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Cash */}
      {hasAnyCash && (
        <section>
          <h2 className='text-xl font-semibold mb-3'>Cash</h2>
          <div className='flex flex-wrap gap-3'>
            {cashBalances
              .filter((c) => c.balance > 0)
              .map((c) => {
                const currency = c.currency as DisplayCurrency
                const symbol = CURRENCY_SYMBOLS[currency] ?? ''
                return (
                  <span
                    key={c.currency}
                    className='inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium'
                  >
                    {c.currency} {symbol}
                    {c.balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )
              })}
          </div>
        </section>
      )}
    </div>
  )
}

function StatusBadge({
  ok,
  okLabel,
  failLabel,
}: {
  ok: boolean
  okLabel: string
  failLabel: string
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
        ok
          ? 'border-green-300 bg-green-50 text-green-800'
          : 'border-yellow-300 bg-yellow-50 text-yellow-800'
      }`}
    >
      <span>{ok ? '✓' : '⚠'}</span>
      <span>{ok ? okLabel : failLabel}</span>
    </div>
  )
}
