'use client'

import { useState, FormEvent } from 'react'

export function StockAdjustForm({
  slug,
  currentStock,
  onAdjusted,
}: {
  slug: string
  currentStock: number
  onAdjusted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [change, setChange] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const changeNum = parseInt(change)
    if (isNaN(changeNum) || changeNum === 0) {
      setError('Change must be a non-zero number')
      return
    }
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }

    setSubmitting(true)
    const res = await fetch(`/api/items/${slug}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ change: changeNum, reason }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to adjust stock')
      setSubmitting(false)
      return
    }

    setChange('')
    setReason('')
    setOpen(false)
    setSubmitting(false)
    onAdjusted()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-indigo-600 hover:underline"
      >
        Adjust Stock
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border bg-gray-50 p-4">
      <div>
        <label className="block text-xs font-medium text-gray-500">Current: {currentStock}</label>
        <input
          type="number"
          value={change}
          onChange={(e) => setChange(e.target.value)}
          placeholder="+5 or -3"
          className="mt-1 w-28 rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500">Reason</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="restock, sold, etc."
          className="mt-1 w-48 rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Applying…' : 'Apply'}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError('') }}
        className="rounded-md border px-4 py-2 text-sm hover:bg-white"
      >
        Cancel
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  )
}
