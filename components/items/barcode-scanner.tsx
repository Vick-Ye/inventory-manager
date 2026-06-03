'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera } from 'lucide-react'

export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLDivElement>(null)
  const stopRef = useRef<() => Promise<void>>(null)
  const runningRef = useRef(false)
  const [error, setError] = useState('')
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return

        const scanner = new Html5Qrcode('barcode-scanner-view')

        stopRef.current = () => {
          runningRef.current = false
          return scanner.stop().catch(() => {})
        }

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            runningRef.current = false
            scanner.stop().catch(() => {})
            if (!cancelled) onDetected(decodedText)
          },
          () => {},
        )

        runningRef.current = true
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Camera access denied or unavailable')
        }
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }

    init()

    return () => {
      cancelled = true
      if (runningRef.current && stopRef.current) {
        stopRef.current()
      }
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Camera size={18} />
            Scan Barcode
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div
          id="barcode-scanner-view"
          ref={videoRef}
          className="overflow-hidden rounded-lg bg-black"
          style={{ minHeight: 250 }}
        />

        {initializing && (
          <p className="mt-2 text-center text-sm text-gray-500">
            Starting camera…
          </p>
        )}

        {error && (
          <p className="mt-2 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
