import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Política de Reembolso — Shopee Video Downloader',
}

export default async function ReembolsoPage() {
  const user = await getSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-16 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Política de Reembolso</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: maio de 2025</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Visão Geral</h2>
            <p>
              Valorizamos a sua satisfação. Esta política descreve as condições sob as quais oferecemos
              reembolsos para os planos pagos do Shopee Video Downloader.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. Direito ao Reembolso</h2>
            <p>Você tem direito a solicitar reembolso integral nas seguintes situações:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Dentro de 7 dias</strong> após a contratação, caso não tenha utilizado os
                benefícios Premium (conforme o Código de Defesa do Consumidor, Art. 49);
              </li>
              <li>
                Falha técnica comprovada no Serviço que impossibilite o uso durante mais de 72 horas
                consecutivas, sem solução por nossa parte;
              </li>
              <li>
                Cobrança duplicada ou incorreta.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. Casos Não Elegíveis</h2>
            <p>Não são elegíveis para reembolso:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Solicitações feitas após 7 dias da contratação;</li>
              <li>Planos cujos benefícios já foram utilizados (downloads realizados com Premium);</li>
              <li>Interrupções causadas por mudanças na plataforma Shopee, fora do nosso controle;</li>
              <li>Arrependimento após uso ativo do plano.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. Como Solicitar</h2>
            <p>Para solicitar um reembolso, envie um e-mail para{' '}
              <a href="mailto:suporte@shopeevideodownloader.com" className="text-[#EE4D2D] hover:underline">
                suporte@shopeevideodownloader.com
              </a>{' '}
              com as seguintes informações:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>E-mail da conta cadastrada;</li>
              <li>Data da compra;</li>
              <li>ID do pagamento (informado após a confirmação do PIX);</li>
              <li>Motivo do reembolso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. Prazo de Processamento</h2>
            <p>
              Após a aprovação da solicitação, o reembolso é processado em até{' '}
              <strong>5 dias úteis</strong> via PIX para a chave utilizada no pagamento original.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. Cancelamento do Plano</h2>
            <p>
              Os planos não possuem renovação automática. Ao expirar o período contratado (30 ou 365
              dias), o acesso Premium é encerrado automaticamente sem cobranças adicionais.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. Contato</h2>
            <p>
              Dúvidas sobre reembolso? Fale conosco em{' '}
              <a href="mailto:suporte@shopeevideodownloader.com" className="text-[#EE4D2D] hover:underline">
                suporte@shopeevideodownloader.com
              </a>{' '}
              ou consulte nossos{' '}
              <Link href="/termos" className="text-[#EE4D2D] hover:underline">
                Termos de Uso
              </Link>.
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}
