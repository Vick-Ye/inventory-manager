'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'

function calcVolume(length: number, width: number, height: number) {
  const ci = length * width * height
  return {
    ci,
    ft3: ci / 1728,
    m3: ci / 61023.744,
  }
}

function calcDimWeight(ci: number, formula: number) {
  if (formula === 5000) {
    const cm3 = ci * 16.387
    return { value: cm3 / 5000, unit: 'kg' }
  }
  return { value: ci / formula, unit: 'lbs' }
}

export function ShippingInfo({
  length,
  width,
  height,
  weight,
}: {
  length: number | null
  width: number | null
  height: number | null
  weight: number | null
}) {
  const [formula, setFormula] = useState(166)

  if (!length || !width || !height) return null

  const vol = calcVolume(length, width, height)
  const dim = calcDimWeight(vol.ci, formula)

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
        <Package size={16} />
        Shipping Info
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Volume: </span>
          <span className="font-medium">{vol.ft3.toFixed(3)} ft³</span>
          <span className="text-gray-400"> / {vol.m3.toFixed(5)} m³</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500">DIM Weight:</span>
        <select
          value={formula}
          onChange={(e) => setFormula(Number(e.target.value))}
          className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
        >
          <option value={166}>DIM / 166 (lbs)</option>
          <option value={139}>DIM / 139 (lbs)</option>
          <option value={5000}>DIM / 5000 (kg)</option>
        </select>
        <span className="font-medium">
          {dim.value.toFixed(1)} {dim.unit}
        </span>
        {weight !== null && weight > 0 && (
          <span className="text-gray-400">
            (actual: {weight} lbs)
          </span>
        )}
      </div>
    </div>
  )
}
