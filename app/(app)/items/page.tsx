'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { SearchBar } from '@/components/items/search-bar'
import { ItemCard } from '@/components/items/item-card'
import { Pagination } from '@/components/ui/pagination'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Item {
  id: number
  slug: string
  name: string
  description: string | null
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

  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId) params.set('categoryId', categoryId)
    params.set('page', String(page))
    params.set('limit', '20')

    const res = await fetch(`/api/items?${params}`)
    const data = await res.json()
    setItems(data.items ?? [])
    setTotal(data.pagination?.total ?? 0)
    setTotalPages(data.pagination?.totalPages ?? 0)
  }, [search, categoryId, page])

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
        <Link
          href="/items/new"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Add Item
        </Link>
      </div>

      <SearchBar
        search={search}
        categoryId={categoryId}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
      />

      {loading ? (
        <p className="py-8 text-center text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-gray-400">
          No items found.{' '}
          <Link href="/items/new" className="text-blue-600 hover:underline">
            Add one
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
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
