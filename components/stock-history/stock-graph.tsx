'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface Entry {
  created_at: string
  new_stock: number
}

export function StockGraph({ data }: { data: Entry[] }) {
  if (data.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Not enough data points for a graph.
      </p>
    )
  }

  const chartData = [...data]
    .reverse()
    .map((d) => ({
      dateTime: d.created_at,
      stock: d.new_stock,
    }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="dateTime"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            tickFormatter={(val: string) => format(parseISO(val), 'MMM d')}
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
          <Tooltip labelFormatter={(val) => format(parseISO(val as string), 'MMM d, yyyy HH:mm')} />
          <Line
            type="monotone"
            dataKey="stock"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
