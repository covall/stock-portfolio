import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  fetchAndStoreDailyPrices,
  getDailyPriceHistory,
} from '@/lib/market-data/stock-price-history'
import { getLatestStockPrices } from '@/lib/market-data/stock-prices'
import { getLatestExchangeRates } from '@/lib/market-data/exchange-rates'
import { computePositions } from '@/lib/portfolio/calculations'
import PriceChart from './_components/price-chart'

type Range = '1m' | '3m' | '6m' | 'max'
const RANGE_DAYS: Record<Range, number> = { '1m': 30, '3m': 90, '6m': 180, max: 1000 }
const RANGE_LABELS: Record<Range, string> = { '1m': '1M', '3m': '3M', '6m': '6M', max: 'Max' }

function isValidRange(v: string | undefined): v is Range {
  return v === '1m' || v === '3m' || v === '6m' || v === 'max'
}

export default async function StockDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>
  searchParams: Promise<{ range?: string }>
}) {
  const [{ symbol: rawSymbol }, { range: rawRange }] = await Promise.all([params, searchParams])
  const symbol = rawSymbol.toUpperCase()
  const range: Range = isValidRange(rawRange) ? rawRange : '3m'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const fetchSucceeded = await fetchAndStoreDailyPrices(supabase, symbol)

  const [priceHistory, stockPrices, { rates }, { data: txRows }] = await Promise.all([
    getDailyPriceHistory(supabase, symbol, RANGE_DAYS[range]),
    getLatestStockPrices(supabase, [symbol]),
    getLatestExchangeRates(supabase),
    supabase
      .from('transactions')
      .select('id, transaction_date, transaction_type, quantity, price, currency, stock_symbol')
      .eq('user_id', user.id)
      .eq('stock_symbol', symbol)
      .order('transaction_date', { ascending: false }),
  ])

  const transactions = txRows ?? []

  // computePositions needs the shape from calculations.ts
  const txForCalc = transactions.map((t) => ({
    stock_symbol: t.stock_symbol,
    transaction_type: t.transaction_type as 'buy' | 'sell',
    quantity: t.quantity,
    price: t.price,
    currency: t.currency,
  }))

  const positions = computePositions(txForCalc, stockPrices, rates)
  const position = positions.find((p) => p.symbol === symbol) ?? null

  const currentPrice = stockPrices[symbol]

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-6'>
        <Link href='/' className='text-sm text-gray-500 hover:text-gray-700'>
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className='text-2xl font-bold mb-4'>{symbol} — Detail</h1>

      {!fetchSucceeded && (
        <div className='mb-6 flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800'>
          <span>⚠</span>
          <span>
            Could not refresh price history from Alpha Vantage
            {!process.env.ALPHA_VANTAGE_API_KEY
              ? ' — set ALPHA_VANTAGE_API_KEY in .env.local'
              : ' (demo key only returns IBM data)'}
            . Showing cached data if available.
          </span>
        </div>
      )}

      {/* Position card */}
      {position !== null ? (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Shares</p>
                <p className='text-xl font-semibold'>{position.netQuantity}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Avg Cost (USD)</p>
                <p className='text-xl font-semibold'>${position.avgCostUSD.toFixed(2)}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Current Price</p>
                <p className='text-xl font-semibold'>
                  {position.currentPriceUSD !== null
                    ? `$${position.currentPriceUSD.toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>P/L</p>
                <p
                  className={`text-xl font-semibold ${
                    position.plUSD === null
                      ? ''
                      : position.plUSD >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                  }`}
                >
                  {position.plUSD !== null && position.plPercent !== null ? (
                    <>
                      {position.plUSD >= 0 ? '+' : ''}${position.plUSD.toFixed(2)}{' '}
                      <span className='text-base'>
                        ({position.plPercent >= 0 ? '+' : ''}
                        {position.plPercent.toFixed(2)}%)
                      </span>
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='mb-6'>
          <CardContent className='py-6'>
            <p className='text-gray-500 text-sm'>
              No open position for {symbol}.
              {currentPrice && (
                <span className='ml-1'>Current price: ${currentPrice.price.toFixed(2)}</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Price history chart */}
      <Card className='mb-6'>
        <CardHeader>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <CardTitle>Price History</CardTitle>
            <div className='flex gap-1'>
              {(Object.keys(RANGE_DAYS) as Range[]).map((r) => (
                <a
                  key={r}
                  href={`/stocks/${symbol}?range=${r}`}
                  className={`px-3 py-1 rounded text-sm font-medium border ${
                    r === range
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-input hover:bg-accent'
                  }`}
                >
                  {RANGE_LABELS[r]}
                </a>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {priceHistory.length > 0 ? (
            <PriceChart data={priceHistory} />
          ) : (
            <div className='flex h-64 items-center justify-center text-gray-400 text-sm'>
              No price history available for this range.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <section>
        <h2 className='text-xl font-semibold mb-3'>Transactions</h2>
        {transactions.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white rounded-lg overflow-hidden'>
              <thead className='bg-gray-100 text-gray-800'>
                <tr>
                  <th className='text-left py-3 px-4 font-semibold'>Date</th>
                  <th className='text-left py-3 px-4 font-semibold'>Type</th>
                  <th className='text-right py-3 px-4 font-semibold'>Qty</th>
                  <th className='text-right py-3 px-4 font-semibold'>Price</th>
                  <th className='text-right py-3 px-4 font-semibold'>Total</th>
                  <th className='text-left py-3 px-4 font-semibold'>Currency</th>
                  <th className='text-left py-3 px-4 font-semibold'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {transactions.map((tx) => (
                  <tr key={tx.id} className='hover:bg-gray-50'>
                    <td className='py-3 px-4 text-sm'>{tx.transaction_date}</td>
                    <td className='py-3 px-4'>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.transaction_type === 'buy'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.transaction_type.toUpperCase()}
                      </span>
                    </td>
                    <td className='py-3 px-4 text-right'>{tx.quantity}</td>
                    <td className='py-3 px-4 text-right'>{tx.price.toFixed(2)}</td>
                    <td className='py-3 px-4 text-right'>
                      {(tx.quantity * tx.price).toFixed(2)}
                    </td>
                    <td className='py-3 px-4 text-sm'>{tx.currency}</td>
                    <td className='py-3 px-4'>
                      <Link
                        href={`/transactions/${tx.id}`}
                        className='text-sm text-blue-600 hover:underline'
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-sm text-gray-500'>No transactions found for {symbol}.</p>
        )}
      </section>
    </div>
  )
}
