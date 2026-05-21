import ModuloPage from '@/components/modulos/modulo-page'

export default function EstrategiaPage() {
  return (
    <ModuloPage
      category="ESTRATEGIA"
      accessKey="estrategia"
      title="Gestão Estratégica"
      subtitle="Planos, relatórios de impacto e documentos de direcção"
      accentColor="#1A5C8A"
      accentBg="#E6F0F7"
      uploadHref="/estrategia/upload"
    />
  )
}
