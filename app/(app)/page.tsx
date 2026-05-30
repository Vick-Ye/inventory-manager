import { sql } from '@/lib/db'
import Link from 'next/link'
import { Package, Activity, Tags } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [itemCount] = await sql`SELECT COUNT(*)::int AS count FROM items`
  const [catCount] = await sql`SELECT COUNT(*)::int AS count FROM categories`
  const [_historyCount] = await sql`SELECT COUNT(*)::int AS count FROM stock_history`

  const recent = await sql`
    SELECT sh.*, i.name AS item_name, i.slug AS item_slug
    FROM stock_history sh
    JOIN items i ON i.id = sh.item_id
    ORDER BY sh.created_at DESC
    LIMIT 10
  `

  const [totalStock] = await sql`SELECT COALESCE(SUM(stock), 0)::int AS total FROM items`
  const [outOfStock] = await sql`SELECT COUNT(*)::int AS count FROM items WHERE stock = 0`

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={22} />
            <div>
              <p className="text-xs text-gray-500">Total Items</p>
              <p className="text-2xl font-bold">{itemCount.count}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Tags className="text-purple-600" size={22} />
            <div>
              <p className="text-xs text-gray-500">Categories</p>
              <p className="text-2xl font-bold">{catCount.count}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Package className="text-green-600" size={22} />
            <div>
              <p className="text-xs text-gray-500">Total Stock</p>
              <p className="text-2xl font-bold">{totalStock.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className={outOfStock.count > 0 ? 'text-red-600' : 'text-gray-400'} size={22} />
            <div>
              <p className="text-xs text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold">{outOfStock.count}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link href="/stock-history" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Change</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No activity yet.
                  </td>
                </tr>
              )}
              {recent.map((e: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/items/${e.item_slug}`} className="text-blue-600 hover:underline">
                      {e.item_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        e.new_stock > e.previous_stock
                          ? 'text-green-600'
                          : e.new_stock < e.previous_stock
                            ? 'text-red-600'
                            : ''
                      }
                    >
                      {e.new_stock > e.previous_stock ? '+' : ''}
                      {e.new_stock - e.previous_stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.previous_stock} → {e.new_stock}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{e.reason ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
