import Link from 'next/link'
import Card from '@/components/ui/Card'
import GoogleSignInButton from '@/components/GoogleSignInButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-[#EE4D2D] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">
              Shopee<span className="text-[#EE4D2D]">Downloader</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
          <p className="text-gray-500 text-sm mt-1">5 downloads/dia gratuitamente</p>
        </div>

        <Card>
          <GoogleSignInButton />

          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-xs text-gray-400">
              Ao entrar, você concorda com os nossos termos de uso.
            </p>
            <p className="text-xs text-gray-400">
              Sem cadastro, sem senha — só o Google.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
