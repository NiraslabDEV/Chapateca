import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, ArrowLeft } from 'lucide-react'

export default function EsqueciSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'linear-gradient(135deg, #1A0836 0%, #461882 60%, #6B2D10 100%)' }}>
      <div className="w-full max-w-sm animate-card-in">
        <div className="flex justify-center mb-6">
          <Image src="/logo-chapateca.svg" alt="Chapateca" width={130} height={44} className="brightness-0 invert" />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          <h1 className="text-lg font-display font-semibold text-[#1A1024] mb-2">Esqueceste a senha?</h1>
          <p className="text-sm text-[#8B7FA8] mb-6 leading-relaxed">
            As senhas são geridas pela direcção da Chapateca. Para repor a tua senha, entra em contacto:
          </p>

          <div className="flex flex-col gap-3 mb-6">
            <a href="mailto:info.chapateca@gmail.com"
               className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#D4C8EC] hover:border-[#461882] hover:bg-[#EDE8F7] transition-all group">
              <div className="w-9 h-9 rounded-full bg-[#EDE8F7] flex items-center justify-center flex-shrink-0 group-hover:bg-[#461882] transition-colors">
                <Mail size={16} className="text-[#461882] group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-[11px] text-[#8B7FA8] font-mono">Email</div>
                <div className="text-sm font-semibold text-[#1A1024]">info.chapateca@gmail.com</div>
              </div>
            </a>

            <a href="tel:+258841499012"
               className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#D4C8EC] hover:border-[#E8652A] hover:bg-[#FFF0E8] transition-all group">
              <div className="w-9 h-9 rounded-full bg-[#FFF0E8] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E8652A] transition-colors">
                <Phone size={16} className="text-[#E8652A] group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-[11px] text-[#8B7FA8] font-mono">WhatsApp / Telefone</div>
                <div className="text-sm font-semibold text-[#1A1024]">+258 84 149 9012</div>
              </div>
            </a>
          </div>

          <Link href="/"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#D4C8EC] rounded-xl text-sm font-medium text-[#4A3D60] hover:border-[#461882] hover:text-[#461882] transition-colors">
            <ArrowLeft size={14} /> Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}
