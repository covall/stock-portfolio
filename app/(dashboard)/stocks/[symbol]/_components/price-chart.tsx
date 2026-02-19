'use client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PricePoint } from '@/lib/market-data/stock-price-history'

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`
}

export default function PriceChart({ data }: { data: PricePoint[] }) {
  const prices = data.map((d) => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.02 || 1
  const yMin = Math.floor(minPrice - padding)
  const yMax = Math.ceil(maxPrice + padding)

  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
        <defs>
          <linearGradient id='priceGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#2563eb' stopOpacity={0.2} />
            <stop offset='95%' stopColor='#2563eb' stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis
          dataKey='date'
          tickFormatter={formatDate}
          interval='preserveStartEnd'
          tick={{ fontSize: 12 }}
        />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={(v: number) => `$${v}`}
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const point = payload[0].payload as PricePoint
            return (
              <div className='rounded border bg-white px-3 py-2 shadow text-sm'>
                <p className='text-gray-500'>{point.date}</p>
                <p className='font-semibold'>${point.price.toFixed(2)}</p>
              </div>
            )
          }}
        />
        <Area
          type='monotone'
          dataKey='price'
          stroke='#2563eb'
          strokeWidth={2}
          fill='url(#priceGradient)'
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
