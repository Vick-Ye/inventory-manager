'use client'

import Link from 'next/link'
import { Edit2, Trash2 } from 'lucide-react'
import { ImageDisplay } from '@/components/ui/image-display'

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
  stock: number
  image_url: string | null
  categories: { id: number; name: string }[]
}

export function ItemCard({
  item,
  onDelete,
}: {
  item: Item
  onDelete: (item: Item) => void
}) {
  return (
    <div className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col shrink-0">
        <Link href={`/items/${item.slug}`}>
          <ImageDisplay
            src={item.image_url}
            alt={item.name}
            className="h-24 w-24 rounded-md object-cover"
            fallbackClassName="h-24 w-24 rounded-md text-xs"
          />
        </Link>
        {item.sku && <p className="mt-1 text-[11px] text-gray-400">SKU: {item.sku}</p>}
        {item.notes && <p className="mt-0.5 max-w-24 truncate text-[11px] text-gray-500">{item.notes}</p>}
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            href={`/items/${item.slug}`}
            className="text-lg font-semibold text-indigo-700 hover:underline"
          >
            {item.name}
          </Link>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-gray-500">
            {item.price !== null && <span className="whitespace-nowrap">${(item.price / 100).toFixed(2)}</span>}
            {item.weight !== null && <span className="whitespace-nowrap">{item.weight} lbs</span>}
            {item.length !== null && item.width !== null && item.height !== null && (
              <span className="whitespace-nowrap">{item.length} × {item.width} × {item.height} in</span>
            )}
            {item.length !== null && (item.width === null || item.height === null) && (
              <span className="whitespace-nowrap">Length: {item.length} in</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {item.categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              item.stock > 5
                ? 'bg-emerald-100 text-emerald-700'
                : item.stock > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/items/${item.slug}/edit`}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
            >
              <Edit2 size={16} />
            </Link>
            <button
              onClick={() => onDelete(item)}
              className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
