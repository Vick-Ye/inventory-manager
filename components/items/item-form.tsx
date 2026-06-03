'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Scan } from 'lucide-react'
import { BarcodeScanner } from '@/components/items/barcode-scanner'

interface Category {
  id: number
  name: string
}

interface ItemData {
  name: string
  notes: string
  price: number
  length: number
  width: number
  height: number
  weight: number
  image_url: string
  barcode: string
  sku: string
  categoryIds: number[]
}

export function ItemForm({
  categories,
  initial,
  onSubmit: submitTo,
  submitLabel = 'Save',
  redirectTo,
}: {
  categories: Category[]
  initial?: ItemData
  onSubmit: (data: ItemData) => Promise<{ ok: boolean; error?: string }>
  submitLabel?: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [price, setPrice] = useState(initial?.price ?? 0)
  const [length, setLength] = useState(initial?.length ?? 0)
  const [width, setWidth] = useState(initial?.width ?? 0)
  const [height, setHeight] = useState(initial?.height ?? 0)
  const [weight, setWeight] = useState(initial?.weight ?? 0)
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [barcode, setBarcode] = useState(initial?.barcode ?? '')
  const [sku, setSku] = useState(initial?.sku ?? '')
  const [categoryIds, setCategoryIds] = useState<number[]>(initial?.categoryIds ?? [])
  const [showScanner, setShowScanner] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { ok, error: err } = await submitTo({
      name, notes, price, length, width, height, weight,
      image_url: imageUrl, barcode, sku, categoryIds,
    })
    if (!ok) {
      setError(err ?? 'Failed to save item')
      setSubmitting(false)
      return
    }
    router.push(redirectTo ?? '/items')
    router.refresh()
  }

  function toggleCategory(id: number) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {typeof error === 'string'
            ? error
            : (() => {
                const e = error as Record<string, unknown>
                const flat = e as { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
                const parts: string[] = []
                if (flat.fieldErrors) {
                  for (const [field, msgs] of Object.entries(flat.fieldErrors)) {
                    parts.push(`${field}: ${msgs.join(', ')}`)
                  }
                }
                if (flat.formErrors?.length) {
                  parts.push(...flat.formErrors)
                }
                return parts.length > 0 ? parts.join('; ') : 'Validation failed'
              })()}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-[8rem_1fr_7rem] gap-4">
        <div className="flex min-h-[5rem] flex-col justify-between">
          <label className="text-sm font-medium text-gray-700">Price ($)</label>
          <input
            type="number" min={0} step="0.01"
            value={price ? price / 100 : ''}
            onChange={(e) => setPrice(Math.round(parseFloat(e.target.value || '0') * 100))}
            placeholder="0.00"
            className="block w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex min-h-[5rem] flex-col justify-between">
          <label className="text-sm font-medium text-gray-700">Dimensions (in)</label>
          <div className="flex items-center gap-0.5">
            <input
              type="number" min={0} step="0.1"
              value={length || ''} onChange={(e) => setLength(parseFloat(e.target.value || '0'))}
              placeholder="L"
              className="block min-w-[3.5rem] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <span className="flex-shrink-0 text-gray-400">×</span>
            <input
              type="number" min={0} step="0.1"
              value={width || ''} onChange={(e) => setWidth(parseFloat(e.target.value || '0'))}
              placeholder="W"
              className="block min-w-[3.5rem] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <span className="flex-shrink-0 text-gray-400">×</span>
            <input
              type="number" min={0} step="0.1"
              value={height || ''} onChange={(e) => setHeight(parseFloat(e.target.value || '0'))}
              placeholder="H"
              className="block min-w-[3.5rem] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex min-h-[5rem] flex-col justify-between">
          <label className="text-sm font-medium text-gray-700">Weight (lbs)</label>
          <input
            type="number" min={0} step="0.1"
            value={weight || ''}
            onChange={(e) => setWeight(parseFloat(e.target.value || '0'))}
            placeholder="0.0"
            className="block w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Barcode (optional)</label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan or type a barcode"
            className="block flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Scan size={16} />
            Scan
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">SKU (optional)</label>
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="e.g. WIDG-001"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {showScanner && (
        <BarcodeScanner
          onDetected={(code) => { setBarcode(code); setShowScanner(false) }}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Categories</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = categoryIds.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selected
                    ? 'bg-indigo-600 text-white'
                    : 'border bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
