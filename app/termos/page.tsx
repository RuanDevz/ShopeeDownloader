import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Termos de Uso — Shopee Video Downloader',
}

export default async function TermosPage() {
  const user = await getSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-16 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: maio de 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o Shopee Video Downloader (&quot;Serviço&quot;), você concorda com estes
              Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. Descrição do Serviço</h2>
            <p>
              O Shopee Video Downloader é uma ferramenta que permite aos usuários extrair e baixar
              vídeos publicados publicamente na plataforma Shopee, para uso pessoal e não comercial.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. Uso Permitido</h2>
            <p>Você concorda em utilizar o Serviço somente para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Download de vídeos de sua própria autoria;</li>
              <li>Download de vídeos com permissão expressa do criador do conteúdo;</li>
              <li>Uso pessoal e não comercial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. Uso Proibido</h2>
            <p>É expressamente proibido:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Redistribuir, revender ou publicar conteúdo baixado sem autorização do detentor dos direitos;</li>
              <li>Utilizar o Serviço para fins comerciais sem consentimento do criador;</li>
              <li>Realizar download massivo ou automatizado (scraping);</li>
              <li>Violar direitos autorais, marcas registradas ou quaisquer direitos de terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo baixado via este Serviço pertence aos seus respectivos criadores e/ou à
              plataforma Shopee. O Shopee Video Downloader não reivindica nenhuma propriedade sobre
              os vídeos extraídos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. Limitação de Responsabilidade</h2>
            <p>
              O Serviço é fornecido &quot;como está&quot;, sem garantias de disponibilidade contínua.
              Não nos responsabilizamos por eventuais interrupções causadas por mudanças na plataforma
              Shopee, nem pelo uso indevido dos vídeos baixados pelos usuários.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. Planos e Pagamentos</h2>
            <p>
              O Serviço oferece planos pagos (Mensal e Anual) com funcionalidades estendidas. Os
              valores são cobrados via PIX no momento da contratação. Para informações sobre
              cancelamento e reembolso, consulte nossa{' '}
              <Link href="/reembolso" className="text-[#EE4D2D] hover:underline">
                Política de Reembolso
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">8. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações
              relevantes serão comunicadas por e-mail ou aviso no site. O uso continuado do Serviço
              após as alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">9. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos, entre em contato pelo e-mail{' '}
              <a href="mailto:suporte@shopeevideodownloader.com" className="text-[#EE4D2D] hover:underline">
                suporte@shopeevideodownloader.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
