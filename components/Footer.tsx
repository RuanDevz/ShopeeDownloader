import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#EE4D2D]">Shopee</span>
          <span className="text-sm text-gray-400">Video Downloader</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-gray-500">
          <Link href="/termos" className="hover:text-gray-800 transition-colors">
            Termos de Uso
          </Link>
          <Link href="/reembolso" className="hover:text-gray-800 transition-colors">
            Política de Reembolso
          </Link>
        </nav>

        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Shopee Video Downloader. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
