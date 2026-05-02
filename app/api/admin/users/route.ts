import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    
    // Verifica se é admin
    if (!user) {
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!adminUser?.isAdmin) {
      return Response.json(
        { success: false, error: 'Acesso negado. Apenas admins.' },
        { status: 403 }
      )
    }

    // Pega parâmetros de paginação e busca
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') ?? '0')
    const take = parseInt(searchParams.get('take') ?? '10')
    const search = searchParams.get('search') ?? ''

    // Lista usuários com suas subscriptions
    const whereClause = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } }
      ]
    } : undefined

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            premiumUntil: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.user.count(whereClause ? { where: whereClause } : undefined)

    return Response.json({
      success: true,
      data: users,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar usuários'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
