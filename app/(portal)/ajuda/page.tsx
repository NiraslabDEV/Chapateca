import { MessageCircle, Mail, Phone, BookOpen, Camera, Upload, Key, HelpCircle } from 'lucide-react'

const FAQ = [
  {
    q: 'Como carregar fotos de uma actividade?',
    a: 'Vai a "Galeria Campo" no menu lateral e clica em "Carregar Fotos". Selecciona as fotos, indica o local e a data da actividade, e clica em Enviar.',
  },
  {
    q: 'Não consigo ver alguns módulos do menu — porquê?',
    a: 'O acesso a cada módulo depende do teu perfil. A equipa de campo tem acesso apenas à Galeria. Se precisas de acesso a outro módulo, contacta a direcção.',
  },
  {
    q: 'Esqueci a minha senha — o que faço?',
    a: 'Clica em "Esqueci a senha" na página de entrada, ou contacta directamente a direcção pelo email ou WhatsApp indicados abaixo.',
  },
  {
    q: 'Como partilhar um álbum de fotos com os doadores?',
    a: 'Na lista de álbuns da Galeria, clica em "Partilhar" — o link é copiado automaticamente para a área de transferência e podes enviá-lo por WhatsApp ou email.',
  },
  {
    q: 'As fotos ficam guardadas onde?',
    a: 'Todas as fotos são enviadas para o Google Drive da Chapateca, organizadas por ano, mês e localização. O portal gere as pastas automaticamente.',
  },
]

export default function AjudaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">Ajuda e Suporte</h1>
        <p className="text-ink-soft text-sm mt-1">Contactos e respostas às perguntas mais frequentes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">

        {/* Coluna esquerda: contactos */}
        <div className="flex flex-col gap-4 lg:col-span-1">

          {/* Suporte técnico */}
          <section className="bg-white border border-sand-light rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={15} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Suporte Técnico</h2>
                <p className="text-[11px] text-ink-soft font-mono">Problemas com o portal</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a href="https://wa.me/258853860621"
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 p-3 rounded-xl border-2 border-sand hover:border-green-400 hover:bg-green-50 transition-all group">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 transition-colors">
                  <MessageCircle size={14} className="text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-[11px] text-ink-soft font-mono">WhatsApp</div>
                  <div className="text-sm font-semibold text-ink">Gabriel dos Santos</div>
                  <div className="text-xs text-ink-soft font-mono">+258 85 386 0621</div>
                </div>
              </a>
            </div>
          </section>

          {/* Direcção */}
          <section className="bg-white border border-sand-light rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#EDE8F7] flex items-center justify-center flex-shrink-0">
                <Key size={14} className="text-[#461882]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Direcção</h2>
                <p className="text-[11px] text-ink-soft font-mono">Acesso e senhas</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a href="mailto:info.chapateca@gmail.com"
                 className="flex items-center gap-3 p-3 rounded-xl border-2 border-sand hover:border-[#461882] hover:bg-[#EDE8F7] transition-all group">
                <div className="w-8 h-8 rounded-full bg-[#EDE8F7] flex items-center justify-center flex-shrink-0 group-hover:bg-[#461882] transition-colors">
                  <Mail size={14} className="text-[#461882] group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-ink-soft font-mono">Email</div>
                  <div className="text-xs font-medium text-ink truncate">info.chapateca@gmail.com</div>
                </div>
              </a>

              <a href="tel:+258841499012"
                 className="flex items-center gap-3 p-3 rounded-xl border-2 border-sand hover:border-gold hover:bg-gold-soft transition-all group">
                <div className="w-8 h-8 rounded-full bg-gold-soft flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-colors">
                  <Phone size={14} className="text-gold group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-[11px] text-ink-soft font-mono">Telefone</div>
                  <div className="text-xs font-medium text-ink">+258 84 149 9012</div>
                </div>
              </a>
            </div>
          </section>

          {/* Versão */}
          <div className="px-4 py-3 bg-sand-light rounded-xl text-[11px] text-ink-soft font-mono text-center">
            Portal Chapateca v0.1 · Maputo, Moçambique<br />
            Desenvolvido por <span className="text-ink-mid font-semibold">Niraslab</span>
          </div>
        </div>

        {/* Coluna direita: FAQ */}
        <div className="lg:col-span-2">
          <section className="bg-white border border-sand-light rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <HelpCircle size={16} className="text-forest" />
              <h2 className="text-sm font-semibold text-ink">Perguntas Frequentes</h2>
            </div>

            <div className="flex flex-col divide-y divide-sand-light">
              {FAQ.map((item, i) => (
                <details key={i} className="group py-4 first:pt-0 last:pb-0">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-sm font-medium text-ink pr-4">{item.q}</span>
                    <span className="w-5 h-5 rounded-full bg-sand-light flex items-center justify-center flex-shrink-0 text-ink-soft
                                     group-open:bg-forest group-open:text-white transition-colors text-xs font-bold">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Guias rápidos */}
          <section className="bg-white border border-sand-light rounded-2xl p-6 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-forest" />
              <h2 className="text-sm font-semibold text-ink">Guias Rápidos</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Upload,  title: 'Carregar Fotos',       desc: 'Como enviar imagens de actividades de campo', href: '/galeria/upload' },
                { icon: Camera,  title: 'Ver a Galeria',         desc: 'Navegar e partilhar álbuns de actividades',   href: '/galeria' },
              ].map(g => (
                <a key={g.href} href={g.href}
                   className="flex items-start gap-3 p-4 rounded-xl border-2 border-sand hover:border-forest hover:bg-parchment-2 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-parchment-2 flex items-center justify-center flex-shrink-0 group-hover:bg-forest transition-colors">
                    <g.icon size={16} className="text-forest group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{g.title}</div>
                    <div className="text-xs text-ink-soft mt-0.5">{g.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
