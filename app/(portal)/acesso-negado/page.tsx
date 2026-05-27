import Link from 'next/link'
import { ShieldOff, ArrowLeft } from 'lucide-react'

export default function AcessoNegadoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <ShieldOff size={28} className="text-red-400" />
      </div>
      <h1 className="font-display text-2xl text-ink mb-2">Acesso restrito</h1>
      <p className="text-sm text-ink-soft max-w-sm mb-8">
        Não tens permissão para aceder a esta secção. Se precisas de acesso, contacta a administração.
      </p>
      <Link
        href="/galeria"
        className="flex items-center gap-2 px-5 py-2.5 bg-ink text-white text-sm font-semibold rounded-xl hover:opacity-85 transition-opacity"
      >
        <ArrowLeft size={15} /> Voltar à Galeria
      </Link>
    </div>
  )
}
