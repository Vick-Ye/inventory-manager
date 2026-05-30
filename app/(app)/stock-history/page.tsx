'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import { DateRangeFilter } from '@/components/stock-history/date-range-filter'
import { HistoryList } from '@/components/stock-history/history-list'
import { StockGraph } from '@/components/stock-history/stock-graph'
import { Pagination } from '@/components/ui/pagination'

interface HistoryEntry {
  id: number
  item_id: number
  item_name: string
  item_slug: string
  previous_stock: number
  new_stock: number
  reason: string | null
  created_at: string
}

function computeTotalStockHistory(
  allHistory: HistoryEntry[],
  currentStocks: { [itemId: number]: number },
) {
  const totalPerItem = { ...currentStocks }
  const points: { created_at: string; new_stock: number }[] = []

  const sorted = [...allHistory].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  for (const entry of sorted) {
    const diff = entry.new_stock - entry.previous_stock
    totalPerItem[entry.item_id] -= diff
    const total = Object.values(totalPerItem).reduce((s, v) => s + v, 0)
    points.push({ created_at: entry.created_at, new_stock: total })
  }

  const currentTotal = Object.values(currentStocks).reduce((s, v) => s + v, 0)
  points.push({ created_at: new Date().toISOString(), new_stock: currentTotal })

  return points
}

export default function StockHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showGraph, setShowGraph] = useState(false)
  const [loading, setLoading] = useState(true)
  const [graphData, setGraphData] = useState<{ created_at: string; new_stock: number }[]>([])

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '50')
    if (startDate) params.set('startDate', new Date(startDate).toISOString())
    if (endDate) params.set('endDate', new Date(endDate + 'T23:59:59').toISOString())

    const res = await fetch(`/api/stock-history?${params}`)
    if (res.ok) {
      const data = await res.json()
      setEntries(data.history ?? [])
      setTotalPages(data.pagination?.totalPages ?? 0)
    }
    setLoading(false)
  }, [page, startDate, endDate])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    if (!showGraph) return
    async function loadGraphData() {
      const [itemsRes, allHistoryRes] = await Promise.all([
        fetch('/api/items?limit=1000'),
        fetch('/api/stock-history?limit=5000'),
      ])
      const itemsData = await itemsRes.json()
      const historyData = await allHistoryRes.json()
      const historyAll: HistoryEntry[] = historyData.history ?? []

      const currentStocks: { [id: number]: number } = {}
      for (const item of itemsData.items ?? []) {
        currentStocks[item.id] = item.stock
      }

      setGraphData(computeTotalStockHistory(historyAll, currentStocks))
    }
    loadGraphData()
  }, [showGraph])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stock History</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={() => setPage(1)}
        />
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <BarChart3 size={16} />
          {showGraph ? 'Hide Graph' : 'Show Graph'}
        </button>
      </div>

      {showGraph && graphData.length >= 2 && (
        <div className="rounded-lg border bg-white p-4">
          <StockGraph data={graphData} />
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-gray-400">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <HistoryList entries={entries} showItem />
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
