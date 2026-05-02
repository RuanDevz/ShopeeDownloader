import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getSession()
    
    // Verifica se é admin
    if (!user) {
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email !== adminEmail) {
      return Response.json(
        { success: false, error: 'Acesso negado.' },
        { status: 403 }
      )
    }

    const body = await request.json() as { premiumDays: number }
    const premiumDays = body.premiumDays ?? 30

    // Busca a subscription do usuário ou cria uma nova
    let subscription = await prisma.subscription.findUnique({
      where: { userId: id }
    })

    if (!subscription) {
      // Cria subscription se não existir
      subscription = await prisma.subscription.create({
        data: {
          userId: id,
          plan: 'PREMIUM',
          premiumUntil: new Date(Date.now() + premiumDays * 24 * 60 * 60 * 1000)
        }
      })
    } else {
      // Atualiza premium
      const currentPremiumUntil = subscription.premiumUntil ?? new Date()
      const newPremiumUntil = new Date(currentPremiumUntil.getTime() + premiumDays * 24 * 60 * 60 * 1000)

      subscription = await prisma.subscription.update({
        where: { userId: id },
        data: {
          plan: 'PREMIUM',
          premiumUntil: newPremiumUntil
        }
      })
    }

    return Response.json({
      success: true,
      message: `Premium ativado por ${premiumDays} dias`,
      data: subscription
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao ativar premium'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getSession()
    
    // Verifica se é admin
    if (!user) {
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email !== adminEmail) {
      return Response.json(
        { success: false, error: 'Acesso negado.' },
        { status: 403 }
      )
    }

    // Remove premium (volta para FREE)
    const subscription = await prisma.subscription.update({
      where: { userId: id },
      data: {
        plan: 'FREE',
        premiumUntil: null
      }
    })

    return Response.json({
      success: true,
      message: 'Premium removido',
      data: subscription
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao remover premium'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
