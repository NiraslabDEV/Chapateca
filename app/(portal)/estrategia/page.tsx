import ModuloPage from '@/components/modulos/modulo-page'

export default function EstrategiaPage() {
  return (
    <ModuloPage
      category="ESTRATEGIA"
      accessKey="estrategia"
      title="Estratégia Financeira"
      subtitle="Planos financeiros, orçamentos estratégicos e captação"
      accentColor="#1A5C8A"
      accentBg="#E0EDF5"
      uploadHref="/estrategia/upload"
    />
  )
}
