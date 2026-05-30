'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit3, Save, X, Search, Plus, PlusCircle, Check } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string | null
}

interface Item {
  id: number
  slug: string
  name: string
  stock: number
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const [showAddPanel, setShowAddPanel] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Item[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [linking, setLinking] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [catRes, itemsRes] = await Promise.all([
        fetch(`/api/categories/${id}`),
        fetch(`/api/items?categoryId=${id}`),
      ])
      if (!catRes.ok) { router.push('/categories'); return }
      const cat = await catRes.json()
      const itemsData = await itemsRes.json()
      setCategory(cat)
      setItems(itemsData.items ?? [])
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/items?search=${encodeURIComponent(search)}&limit=20`)
      const data = await res.json()
      const existingIds = new Set(items.map((i) => i.id))
      setSearchResults((data.items ?? []).filter((i: Item) => !existingIds.has(i.id)))
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, items])

  async function handleSaveDescription() {
    if (!category) return
    setSaving(true)
    const res = await fetch(`/api/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: editDesc || null }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCategory(updated)
      setEditing(false)
    }
    setSaving(false)
  }

  function startEdit() {
    setEditDesc(category?.description ?? '')
    setEditing(true)
  }

  function toggleSelect(itemId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  async function handleLinkItems() {
    if (selectedIds.size === 0) return
    setLinking(true)
    const res = await fetch(`/api/categories/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds: Array.from(selectedIds) }),
    })
    if (res.ok) {
      setSelectedIds(new Set())
      setSearch('')
      setShowAddPanel(false)
      fetchData()
    }
    setLinking(false)
  }

  if (loading) return <p className="py-12 text-center text-gray-400">Loading…</p>
  if (!category) return <p className="py-12 text-center text-gray-400">Category not found.</p>

  return (
    <div className="space-y-6">
      <Link
        href="/categories"
        className="flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to Categories
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{category.name}</h1>

          {editing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-gray-500">{category.description ?? 'No description'}</p>
              <button
                onClick={startEdit}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
              >
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Items</h2>
          <button
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Items
          </button>
        </div>

        {showAddPanel && (
          <div className="mb-4 rounded-lg border bg-blue-50 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="relative flex-1">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search existing items…"
                  className="w-full rounded-md border px-3 py-2 pl-9 text-sm focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <Link
                href={`/items/new?categoryId=${id}`}
                className="flex items-center gap-1.5 rounded-md border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <PlusCircle size={15} />
                New Item
              </Link>
            </div>

            {search && (
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {searching ? (
                  <p className="py-2 text-center text-sm text-gray-400">Searching…</p>
                ) : searchResults.length === 0 ? (
                  <p className="py-2 text-center text-sm text-gray-400">No matching items found.</p>
                ) : (
                  searchResults.map((item) => {
                    const selected = selectedIds.has(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelect(item.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                          selected ? 'bg-blue-100' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="ml-2 text-gray-500">Stock: {item.stock}</span>
                        </div>
                        {selected && <Check size={16} className="text-blue-600" />}
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {selectedIds.size > 0 && (
              <button
                onClick={handleLinkItems}
                disabled={linking}
                className="mt-3 rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {linking ? 'Adding…' : `Add ${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <p className="py-8 text-center text-gray-400">
            No items in this category. Use &ldquo;Add Items&rdquo; above to link existing items or create a new one.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/items/${item.slug}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.stock}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/items/${item.slug}/edit`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit3 size={13} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
