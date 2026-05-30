'use client'

import Link from 'next/link'
import { format, parseISO } from 'date-fns'

interface Entry {
  id: number
  item_id: number
  item_name?: string
  item_slug?: string
  previous_stock: number
  new_stock: number
  reason: string | null
  created_at: string
}

export function HistoryList({
  entries,
  showItem = false,
}: {
  entries: Entry[]
  showItem?: boolean
}) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No history entries found.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs uppercase text-gray-500">
            {showItem && <th className="px-4 pb-2 pt-3 font-medium">Item</th>}
            <th className="px-4 pb-2 pt-3 font-medium">Date</th>
            <th className="px-4 pb-2 pt-3 font-medium">Previous</th>
            <th className="px-4 pb-2 pt-3 font-medium">Change</th>
            <th className="px-4 pb-2 pt-3 font-medium">New</th>
            <th className="px-4 pb-2 pt-3 font-medium">Reason</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
              {showItem && (
                <td className="px-4 py-3">
                  <Link
                    href={`/items/${e.item_slug}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {e.item_name}
                  </Link>
                </td>
              )}
              <td className="px-4 py-3 text-gray-500">
                {format(parseISO(e.created_at), 'MMM d, yyyy HH:mm')}
              </td>
              <td className="px-4 py-3">{e.previous_stock}</td>
              <td
                className={`px-4 py-3 font-medium ${
                  e.new_stock > e.previous_stock ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {e.new_stock > e.previous_stock ? '+' : ''}
                {e.new_stock - e.previous_stock}
              </td>
              <td className="px-4 py-3 font-medium">{e.new_stock}</td>
              <td className="px-4 py-3 text-gray-500">{e.reason ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
