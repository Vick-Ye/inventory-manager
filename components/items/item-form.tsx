'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
}

interface ItemData {
  name: string
  description: string
  image_url: string
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
  const [description, setDescription] = useState(initial?.description ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [categoryIds, setCategoryIds] = useState<number[]>(initial?.categoryIds ?? [])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { ok, error: err } = await submitTo({ name, description, image_url: imageUrl, categoryIds })
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
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

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
                    ? 'bg-blue-600 text-white'
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
        className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
