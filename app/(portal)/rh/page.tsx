import ModuloPage from '@/components/modulos/modulo-page'

export default function RHPage() {
  return (
    <ModuloPage
      category="RH"
      accessKey="rh"
      title="Recursos Humanos"
      subtitle="Contratos, salários, formações e gestão da equipa"
      accentColor="#9C5B1F"
      accentBg="#F5E8D8"
      uploadHref="/rh/upload"
    />
  )
}
