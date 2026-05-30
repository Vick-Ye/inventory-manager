'use client'

import Link from 'next/link'
import { Edit2, Trash2 } from 'lucide-react'
import { ImageDisplay } from '@/components/ui/image-display'

interface Item {
  id: number
  slug: string
  name: string
  description: string | null
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
    <div className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm">
      <Link href={`/items/${item.slug}`} className="shrink-0">
        <ImageDisplay
          src={item.image_url}
          alt={item.name}
          className="h-24 w-24 rounded-md object-cover"
          fallbackClassName="h-24 w-24 rounded-md text-xs"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            href={`/items/${item.slug}`}
            className="text-lg font-semibold text-blue-700 hover:underline"
          >
            {item.name}
          </Link>
          {item.description && (
            <p className="mt-1 truncate text-sm text-gray-500">{item.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {item.categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-sm font-medium ${
              item.stock > 0 ? 'text-green-700' : item.stock === 0 ? 'text-gray-400' : 'text-red-600'
            }`}
          >
            Stock: {item.stock}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/items/${item.slug}/edit`}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
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
