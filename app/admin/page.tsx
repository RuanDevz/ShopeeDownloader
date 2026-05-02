'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface User {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  createdAt: string
  subscription: {
    plan: string
    premiumUntil: string | null
  } | null
}

interface ApiResponse {
  success: boolean
  data: User[]
  total: number
  page: number
  pages: number
  error?: string
}

export default function AdminPanel() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE
      const params = new URLSearchParams({
        skip: skip.toString(),
        take: ITEMS_PER_PAGE.toString(),
        ...(search && { search })
      })

      const res = await fetch(`/api/admin/users?${params}`)
      const json = (await res.json()) as ApiResponse

      if (!json.success) {
        setError(json.error ?? 'Erro ao carregar usuários')
        router.push('/login')
        return
      }

      setUsers(json.data)
      setTotal(json.total)
    } catch {
      setError('Falha na conexão')
    } finally {
      setLoading(false)
    }
  }

  function handleActivatePremium(userId: string) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/premium`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ premiumDays: 30 })
        })

        const json = await res.json()
        if (!json.success) {
          setError(json.error ?? 'Erro ao ativar premium')
          return
        }

        // Atualiza lista
        await fetchUsers()
      } catch {
        setError('Falha na conexão')
      }
    })
  }

  function handleRemovePremium(userId: string) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/premium`, {
          method: 'DELETE'
        })

        const json = await res.json()
        if (!json.success) {
          setError(json.error ?? 'Erro ao remover premium')
          return
        }

        // Atualiza lista
        await fetchUsers()
      } catch {
        setError('Falha na conexão')
      }
    })
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">Gerenciar usuários e ativar premium</p>
        </div>

        {/* Busca */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por email ou nome..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent"
          />
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE4D2D]"></div>
            <p className="mt-2 text-gray-600">Carregando usuários...</p>
          </div>
        )}

        {/* Tabela de usuários */}
        {!loading && users.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Nome</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Premium Até</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Admin</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const isPremium = user.subscription?.plan === 'PREMIUM' && 
                      user.subscription?.premiumUntil && 
                      new Date(user.subscription.premiumUntil) > new Date()
                    const premiumUntilDate = user.subscription?.premiumUntil
                      ? new Date(user.subscription.premiumUntil).toLocaleDateString('pt-BR')
                      : '-'

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{user.email}</td>
                        <td className="px-4 py-3 text-gray-600">{user.name || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            isPremium
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isPremium ? '✓ Premium' : 'Gratuito'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{premiumUntilDate}</td>
                        <td className="px-4 py-3">
                          {user.isAdmin && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {!isPremium && (
                              <button
                                onClick={() => handleActivatePremium(user.id)}
                                disabled={isPending}
                                className="px-3 py-1 bg-[#EE4D2D] text-white rounded-lg text-xs font-semibold hover:bg-[#d43f1f] disabled:opacity-50 transition-colors"
                              >
                                {isPending ? 'Ativando...' : 'Ativar Premium'}
                              </button>
                            )}
                            {isPremium && (
                              <button
                                onClick={() => handleRemovePremium(user.id)}
                                disabled={isPending}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
                              >
                                {isPending ? 'Removendo...' : 'Remover Premium'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Sem usuários */}
        {!loading && users.length === 0 && (
          <Card className="py-12 text-center">
            <p className="text-gray-600">Nenhum usuário encontrado.</p>
          </Card>
        )}

        {/* Paginação */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Próximo →
            </button>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 text-center">
          Total: {total} usuários
        </div>
      </div>
    </div>
  )
}
