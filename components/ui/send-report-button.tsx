'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { triggerMonthlyReport } from '@/app/actions/send-report'

export function SendReportButton() {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')

  async function handleClick() {
    setSending(true)
    setStatus('idle')
    try {
      await triggerMonthlyReport()
      setStatus('sent')
    } catch {
      setStatus('error')
    } finally {
      setSending(false)
    }
  }

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="text-indigo-600" size={22} />
          <div>
            <p className="text-sm font-medium">Monthly Report</p>
            <p className="text-xs text-gray-500">
              {status === 'sent'
                ? 'Report sent successfully'
                : status === 'error'
                  ? 'Failed to send report'
                  : 'Manually send the monthly report for testing'}
            </p>
          </div>
        </div>
        <button
          onClick={handleClick}
          disabled={sending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Send Report'}
        </button>
      </div>
    </div>
  )
}
