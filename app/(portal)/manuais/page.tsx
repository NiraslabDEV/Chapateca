import ModuloPage from '@/components/modulos/modulo-page'

export default function ManuaisPage() {
  return (
    <ModuloPage
      category="MANUAIS"
      accessKey="manuais"
      title="Manuais e Guias"
      subtitle="Documentação oficial, regulamentos e procedimentos internos"
      accentColor="#2D5220"
      accentBg="#EBF5E6"
      uploadHref="/manuais/upload"
    />
  )
}
