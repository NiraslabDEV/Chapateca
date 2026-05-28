import ModuloPage from '@/components/modulos/modulo-page'

export default function EventosPage() {
  return (
    <ModuloPage
      category="EVENTOS"
      accessKey="eventos"
      title="Eventos · Documentos"
      subtitle="Convites, programas, materiais e relatórios de eventos"
      accentColor="#1F7A6A"
      accentBg="#DCEEEA"
      uploadHref="/eventos/upload"
    />
  )
}
