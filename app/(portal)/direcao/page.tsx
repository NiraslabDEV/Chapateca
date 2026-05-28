import ModuloPage from '@/components/modulos/modulo-page'

export default function DirecaoPage() {
  return (
    <ModuloPage
      category="DIRECAO"
      accessKey="direcao"
      title="Direção"
      subtitle="Actas, decisões e documentos da Direcção"
      accentColor="#5A2D8C"
      accentBg="#EDE8F7"
      uploadHref="/direcao/upload"
    />
  )
}
