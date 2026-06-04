'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera } from 'lucide-react'
import { BarcodeScanner } from '@/components/items/barcode-scanner'

export default function ScanPage() {
  const router = useRouter()
  const [manualCode, setManualCode] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [searching, setSearching] = useState(false)

  async function lookupBarcode(code: string) {
    setSearching(true)

    const res = await fetch(`/api/items/by-barcode/${encodeURIComponent(code)}`)
    if (res.ok) {
      const item = await res.json()
      router.push(`/items/${item.slug}?adjustStock=true`)
    } else {
      router.push(`/items/new?barcode=${encodeURIComponent(code)}`)
    }
  }

  function handleDetected(code: string) {
    setManualCode(code)
    setShowCamera(false)
    lookupBarcode(code)
  }

  function handleManualSubmit(e: FormEvent) {
    e.preventDefault()
    if (!manualCode.trim()) return
    lookupBarcode(manualCode.trim())
  }

  return (
    <div className="space-y-6">
      <Link
        href="/items"
        className="flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to Items
      </Link>

      <h1 className="text-2xl font-bold">Scan Barcode</h1>

      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Type or scan a barcode…"
          className="block flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={searching || !manualCode.trim()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {searching ? 'Searching…' : 'Lookup'}
        </button>
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <Camera size={16} />
          Camera
        </button>
      </form>

      {showCamera && (
        <BarcodeScanner onDetected={handleDetected} onClose={() => setShowCamera(false)} />
      )}

      {searching && (
        <p className="text-center text-sm text-gray-500">Looking up barcode…</p>
      )}
    </div>
  )
}
