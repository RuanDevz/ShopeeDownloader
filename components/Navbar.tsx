'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import { useState } from 'react'

interface NavbarProps {
  user?: { email: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    setMenuOpen(false)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 bg-[#EE4D2D] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">
            Shopee<span className="text-[#EE4D2D]">Downloader</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Preços
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button size="sm" variant="outline">Dashboard</Button>
              </Link>
              <Button size="sm" variant="ghost" loading={loading} onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link
            href="/pricing"
            className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Preços
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                {loading ? 'Saindo...' : 'Sair'}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center w-full bg-[#EE4D2D] hover:bg-[#d44427] text-white font-semibold py-3 rounded-xl text-sm transition-all mt-1"
              onClick={() => setMenuOpen(false)}
            >
              Entrar com Google
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
