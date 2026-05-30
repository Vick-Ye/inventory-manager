'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Trash2, BarChart3 } from 'lucide-react'
import { ImageDisplay } from '@/components/ui/image-display'
import { DateRangeFilter } from '@/components/stock-history/date-range-filter'
import { HistoryList } from '@/components/stock-history/history-list'
import { StockGraph } from '@/components/stock-history/stock-graph'
import { Pagination } from '@/components/ui/pagination'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { StockAdjustForm } from '@/components/items/stock-adjust-form'

interface Item {
  id: number
  slug: string
  name: string
  description: string | null
  stock: number
  image_url: string | null
  categories: { id: number; name: string }[]
  created_at: string
  updated_at: string
}

interface HistoryEntry {
  id: number
  item_id: number
  previous_stock: number
  new_stock: number
  reason: string | null
  created_at: string
}

export default function ItemDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showGraph, setShowGraph] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    const res = await fetch(`/api/items/${slug}`)
    if (!res.ok) {
      router.push('/items')
      return
    }
    setItem(await res.json())
  }, [slug, router])

  const fetchHistory = useCallback(async () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (startDate) params.set('startDate', new Date(startDate).toISOString())
    if (endDate) params.set('endDate', new Date(endDate + 'T23:59:59').toISOString())

    const res = await fetch(`/api/items/${slug}/stock-history?${params}`)
    if (res.ok) {
      const data = await res.json()
      setHistory(data.history ?? [])
      setTotalPages(data.pagination?.totalPages ?? 0)
    }
  }, [slug, page, startDate, endDate])

  useEffect(() => {
    let cancelled = false
    async function load() {
      await fetchItem()
      if (cancelled) return
      await fetchHistory()
      if (cancelled) return
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [fetchItem, fetchHistory])

  async function handleDelete() {
    if (!item) return
    await fetch(`/api/items/${item.id}`, { method: 'DELETE' })
    router.push('/items')
    router.refresh()
  }

  function onStockAdjusted() {
    fetchItem()
    fetchHistory()
  }

  if (loading || !item) {
    return <p className="py-12 text-center text-gray-400">Loading…</p>
  }

  return (
    <div className="space-y-8">
      <Link
        href="/items"
        className="flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to Items
      </Link>

      <div className="flex flex-wrap gap-6">
        <ImageDisplay
          src={item.image_url}
          alt={item.name}
          className="h-48 w-48 rounded-lg object-cover shadow"
          fallbackClassName="h-48 w-48 rounded-lg text-sm"
        />

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{item.name}</h1>
              {item.description && (
                <p className="mt-1 text-gray-500">{item.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/items/${slug}/edit`}
                className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              >
                <Edit2 size={18} />
              </Link>
              <button
                onClick={() => setShowDelete(true)}
                className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {item.categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {c.name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Stock:</span>
            <span
              className={`text-xl font-bold ${
                item.stock > 0 ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {item.stock}
            </span>
          </div>

          <StockAdjustForm slug={slug} currentStock={item.stock} onAdjusted={onStockAdjusted} />

          <div className="flex gap-6 text-xs text-gray-400">
            <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Stock History</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <BarChart3 size={16} />
              {showGraph ? 'Hide Graph' : 'Show Graph'}
            </button>
          </div>
        </div>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={() => setPage(1)}
        />

        {showGraph && (
          <div className="rounded-lg border bg-white p-4">
            <StockGraph data={history} />
          </div>
        )}

        <HistoryList entries={history} />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This will also remove all its stock history.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
