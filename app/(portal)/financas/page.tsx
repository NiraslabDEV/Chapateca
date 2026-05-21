import ModuloPage from '@/components/modulos/modulo-page'

export default function FinancasPage() {
  return (
    <ModuloPage
      category="FINANCEIRO"
      accessKey="financas"
      title="Departamento Financeiro"
      subtitle="Orçamentos, relatórios e documentação contabilística"
      accentColor="#8B3A3A"
      accentBg="#F7ECEC"
      uploadHref="/financas/upload"
    />
  )
}
