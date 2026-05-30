'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ItemForm } from '@/components/items/item-form'

interface Category {
  id: number
  name: string
}

export default function NewItemPage() {
  const searchParams = useSearchParams()
  const preselectedCategoryId = searchParams.get('categoryId')
  const [categories, setCategories] = useState<Category[]>([])
  const [stock, setStock] = useState(0)

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {})
  }, [])

  const initialCategoryIds = preselectedCategoryId
    ? [parseInt(preselectedCategoryId)]
    : undefined

  async function handleSubmit(data: { name: string; description: string; image_url: string; categoryIds: number[] }) {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, stock }),
    })
    return { ok: res.ok, error: res.ok ? undefined : (await res.json()).error ?? 'Failed to create item' }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Item</h1>
      {categories.length === 0 ? (
        <p className="text-sm text-gray-400">Loading categories…</p>
      ) : (
        <div className="max-w-lg space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Initial Stock</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <ItemForm
            categories={categories}
            onSubmit={handleSubmit}
            submitLabel="Create Item"
            initial={initialCategoryIds ? { name: '', description: '', image_url: '', categoryIds: initialCategoryIds } : undefined}
          />
        </div>
      )}
    </div>
  )
}
