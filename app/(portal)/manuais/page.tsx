import ModuloPage from '@/components/modulos/modulo-page'

export default function ManuaisPage() {
  return (
    <ModuloPage
      category="MANUAIS"
      accessKey="manuais"
      title="Procedimentos Internos e Regulamentos"
      subtitle="Documentação oficial, regulamentos e procedimentos internos"
      accentColor="#2D5220"
      accentBg="#E8EDE2"
      uploadHref="/manuais/upload"
    />
  )
}
