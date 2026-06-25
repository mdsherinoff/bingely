'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { WeeklyBlock } from '@/types/media'

interface ProgressChartProps {
  blocks: WeeklyBlock[]
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink border-gold/20 rounded-sm border px-3 py-2">
      <p className="text-parchment/40 font-mono text-xs tracking-widest">
        WEEK {label}
      </p>
      <p className="font-body text-parchment text-sm">
        {payload[0].value}% complete
      </p>
    </div>
  )
}

export default function ProgressChart({ blocks }: ProgressChartProps) {
  const data = blocks.map((b) => ({
    week: b.week,
    percent: b.cumulativePercent,
  }))

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-parchment text-2xl">Progress curve</h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          >
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9922A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9922A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              tick={{
                fill: '#F2E8D580',
                fontSize: 10,
                fontFamily: 'var(--font-space-mono)',
              }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Week',
                position: 'insideBottom',
                offset: -2,
                fill: '#F2E8D540',
                fontSize: 10,
                fontFamily: 'var(--font-space-mono)',
              }}
            />
            <YAxis
              tick={{
                fill: '#F2E8D580',
                fontSize: 10,
                fontFamily: 'var(--font-space-mono)',
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="percent"
              stroke="#C9922A"
              strokeWidth={1.5}
              fill="url(#goldGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#C9922A', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
