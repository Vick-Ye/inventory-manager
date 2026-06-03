'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ItemForm } from '@/components/items/item-form'
import { StockAdjustForm } from '@/components/items/stock-adjust-form'

interface Category {
  id: number
  name: string
}

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
  image_url: string | null
  barcode: string | null
  stock: number
  categories: { id: number; name: string }[]
}

export default function EditItemPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/items/${slug}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([itemData, catData]) => {
      setItem(itemData)
      setCategories(catData)
      setLoading(false)
    }).catch(() => {
      router.push('/items')
    })
  }, [slug, router])

  async function handleSubmit(data: { name: string; notes: string; price: number; length: number; width: number; height: number; weight: number; image_url: string; barcode: string; sku: string; categoryIds: number[] }) {
    const res = await fetch(`/api/items/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return { ok: res.ok, error: res.ok ? undefined : (await res.json()).error ?? 'Failed to update item' }
  }

  function reloadItem() {
    fetch(`/api/items/${slug}`).then((r) => r.json()).then(setItem).catch(() => {})
  }

  if (loading) {
    return <p className="py-12 text-center text-gray-400">Loading…</p>
  }

  if (!item) {
    return <p className="py-12 text-center text-gray-400">Item not found.</p>
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/items/${slug}`}
        className="flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to {item.name}
      </Link>

      <h1 className="text-2xl font-bold">Edit Item</h1>

      <ItemForm
        categories={categories}
        initial={{
          name: item.name,
          notes: item.notes ?? '',
          price: item.price ?? 0,
          length: typeof item.length === 'string' ? parseFloat(item.length) : (item.length ?? 0),
          width: typeof item.width === 'string' ? parseFloat(item.width) : (item.width ?? 0),
          height: typeof item.height === 'string' ? parseFloat(item.height) : (item.height ?? 0),
          weight: typeof item.weight === 'string' ? parseFloat(item.weight) : (item.weight ?? 0),
          image_url: item.image_url ?? '',
          barcode: item.barcode ?? '',
          sku: item.sku ?? '',
          categoryIds: item.categories.map((c) => c.id),
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        redirectTo={`/items/${slug}`}
      />

      <div className="border-t pt-6">
        <h2 className="mb-3 text-lg font-semibold">Stock Adjustment</h2>
        <p className="mb-3 text-sm text-gray-500">
          Current stock: <strong>{item.stock}</strong>
        </p>
        <StockAdjustForm slug={slug} currentStock={item.stock} onAdjusted={reloadItem} />
      </div>
    </div>
  )
}
