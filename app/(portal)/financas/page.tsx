import ModuloPage from '@/components/modulos/modulo-page'

export default function FinancasPage() {
  return (
    <ModuloPage
      category="FINANCEIRO"
      accessKey="financas"
      title="Contabilidade"
      subtitle="Lançamentos, relatórios contabilísticos e contratos"
      accentColor="#8B3A3A"
      accentBg="#F5E0E0"
      uploadHref="/financas/upload"
    />
  )
}
