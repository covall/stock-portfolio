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
import type { PortfolioValuePoint } from '@/lib/portfolio/history'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-')
  return `${MONTHS[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`
}

export default function PortfolioChart({
  data,
  currencySymbol,
  currency,
}: {
  data: PortfolioValuePoint[]
  currencySymbol: string
  currency: string
}) {
  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const padding = (maxVal - minVal) * 0.05 || 100
  const yMin = Math.floor(minVal - padding)
  const yMax = Math.ceil(maxVal + padding)

  const first = data[0]?.value ?? 0
  const last = data[data.length - 1]?.value ?? 0
  const isPositive = last >= first

  const color = isPositive ? '#16a34a' : '#dc2626' // green-600 / red-600

  return (
    <ResponsiveContainer width='100%' height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
        <defs>
          <linearGradient id='portfolioGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor={color} stopOpacity={0.2} />
            <stop offset='95%' stopColor={color} stopOpacity={0} />
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
          tickFormatter={(v: number) =>
            `${currencySymbol}${Math.round(v).toLocaleString('en-US')}`
          }
          tick={{ fontSize: 11 }}
          width={72}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const point = payload[0].payload as PortfolioValuePoint
            return (
              <div className='rounded border bg-white px-3 py-2 shadow text-sm'>
                <p className='text-gray-500'>{point.date}</p>
                <p className='font-semibold'>
                  {currencySymbol}
                  {point.value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {currency}
                </p>
              </div>
            )
          }}
        />
        <Area
          type='monotone'
          dataKey='value'
          stroke={color}
          strokeWidth={2}
          fill='url(#portfolioGradient)'
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
