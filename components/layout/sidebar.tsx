'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Activity,
  Tags,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { betterAuthClient } from '@/lib/auth-client'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/items', label: 'Items', icon: Package },
  { href: '/items/new', label: 'Add Item', icon: PlusCircle },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/stock-history', label: 'Stock History', icon: Activity },
]

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await betterAuthClient.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((l) => {
        const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <l.icon size={18} />
            {l.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-md border bg-white p-2 shadow md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-white p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-bold">Inventory</span>
              <button onClick={() => setMobileOpen(false)} className="rounded p-1 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            {nav}
            <div className="mt-auto border-t pt-4">
              <p className="mb-3 truncate text-sm text-gray-500">{userEmail}</p>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white p-4 md:flex md:flex-col">
        <div className="mb-8 text-lg font-bold">Inventory Manager</div>
        {nav}
        <div className="mt-auto border-t pt-4">
          <p className="mb-3 truncate text-sm text-gray-500">{userEmail}</p>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
