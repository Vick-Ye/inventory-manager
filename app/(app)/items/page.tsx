'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PlusCircle, LayoutGrid, List, Edit2, Trash2 } from 'lucide-react'
import { ImageDisplay } from '@/components/ui/image-display'
import { SearchBar } from '@/components/items/search-bar'
import { ItemCard } from '@/components/items/item-card'
import { Pagination } from '@/components/ui/pagination'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Item {
  id: number
  slug: string
  name: string
  notes: string | null
  price: number | null
  length: number | null
  width: number | null
  height: number | null
  weight: number | null
  sku: string | null
  stock: number
  image_url: string | null
  categories: { id: number; name: string }[]
}

interface Category {
  id: number
  name: string
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [minVolume, setMinVolume] = useState('')
  const [maxVolume, setMaxVolume] = useState('')
  const [minDim, setMinDim] = useState('')
  const [maxDim, setMaxDim] = useState('')
  const [dimFormula, setDimFormula] = useState('166')

  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId) params.set('categoryId', categoryId)
    if (minVolume) params.set('minVolume', minVolume)
    if (maxVolume) params.set('maxVolume', maxVolume)
    if (minDim) params.set('minDim', minDim)
    if (maxDim) params.set('maxDim', maxDim)
    if (dimFormula !== '166') params.set('dimFormula', dimFormula)
    params.set('page', String(page))
    params.set('limit', '20')

    const res = await fetch(`/api/items?${params}`)
    const data = await res.json()
    setItems(data.items ?? [])
    setTotal(data.pagination?.total ?? 0)
    setTotalPages(data.pagination?.totalPages ?? 0)
  }, [search, categoryId, page, minVolume, maxVolume, minDim, maxDim, dimFormula])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchItems().then(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [fetchItems])

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {})
  }, [])

  const handleSearchChange = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  const handleCategoryChange = (v: string) => {
    setCategoryId(v)
    setPage(1)
  }

  async function handleDelete(item: Item) {
    setDeleteTarget(item)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await fetch(`/api/items/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    fetchItems()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Items</h1>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-md border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <List size={16} />
            </button>
          </div>
          <Link
            href="/items/new"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <PlusCircle size={18} />
            Add Item
          </Link>
        </div>
      </div>

      <SearchBar
        search={search}
        categoryId={categoryId}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
      />

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-indigo-600 hover:underline"
      >
        {showAdvanced ? 'Hide' : 'Show'} advanced filters
      </button>

      {showAdvanced && (
        <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-gray-50 p-4">
          <div>
            <label className="block text-xs font-medium text-gray-500">Min Volume (in³)</label>
            <input
              type="number" min={0}
              value={minVolume}
              onChange={(e) => { setMinVolume(e.target.value); setPage(1) }}
              className="mt-1 block w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Max Volume (in³)</label>
            <input
              type="number" min={0}
              value={maxVolume}
              onChange={(e) => { setMaxVolume(e.target.value); setPage(1) }}
              className="mt-1 block w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Min DIM Weight</label>
            <input
              type="number" min={0}
              value={minDim}
              onChange={(e) => { setMinDim(e.target.value); setPage(1) }}
              placeholder="lbs / kg"
              className="mt-1 block w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Max DIM Weight</label>
            <input
              type="number" min={0}
              value={maxDim}
              onChange={(e) => { setMaxDim(e.target.value); setPage(1) }}
              placeholder="lbs / kg"
              className="mt-1 block w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">DIM Formula</label>
            <select
              value={dimFormula}
              onChange={(e) => { setDimFormula(e.target.value); setPage(1) }}
              className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="166">DIM / 166 (lbs)</option>
              <option value="139">DIM / 139 (lbs)</option>
              <option value="5000">DIM / 5000 (kg)</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-gray-400">
          No items found.{' '}
          <Link href="/items/new" className="text-indigo-600 hover:underline">
            Add one
          </Link>
        </p>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Categories</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/items/${item.slug}`}>
                      <ImageDisplay
                        src={item.image_url}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover"
                        fallbackClassName="h-10 w-10 rounded text-[10px]"
                      />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/items/${item.slug}`}
                      className="font-medium text-indigo-700 hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.price !== null ? `$${(item.price / 100).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.categories.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.stock > 5
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.stock > 0
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/items/${item.slug}/edit`}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        {total} item{total !== 1 ? 's' : ''} found
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all its stock history.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
