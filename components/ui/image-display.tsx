'use client'

import { useState } from 'react'

export function ImageDisplay({
  src,
  alt,
  className,
  fallbackClassName,
}: {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
}) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${fallbackClassName ?? className ?? ''}`}
      >
        No image found
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
