'use client'

import { Search } from 'lucide-react'

export function SearchBar({
  search,
  categoryId,
  categories,
  onSearchChange,
  onCategoryChange,
}: {
  search: string
  categoryId: string
  categories: { id: number; name: string }[]
  onSearchChange: (v: string) => void
  onCategoryChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or description..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <select
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}
