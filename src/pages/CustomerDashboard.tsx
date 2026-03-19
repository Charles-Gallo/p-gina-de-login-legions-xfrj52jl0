import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ExternalLink, BarChart3 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

const mockWidgets = [
  {
    id: 1,
    title: 'Visão Geral de Vendas',
    url: 'https://lookerstudio.google.com/reporting/12345-abcde',
  },
  {
    id: 2,
    title: 'Métricas de Marketing',
    url: 'https://lookerstudio.google.com/reporting/67890-fghij',
  },
  {
    id: 3,
    title: 'Análise de Desempenho Anual',
    url: 'https://lookerstudio.google.com/reporting/11111-kkkkk',
  },
]

export default function CustomerDashboard() {
  const { isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || role !== 'customer') {
      navigate('/entrar', { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleLogout = () => {
    logout()
    navigate('/entrar')
  }

  if (!isAuthenticated || role !== 'customer') return null

  return (
    <div className="w-full h-full flex flex-col absolute inset-0 bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo className="scale-75 origin-left" />
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-sm font-medium text-slate-700">
            Olá, Cliente Exemplo
          </span>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-[#ed1b32] border-[#ed1b32] hover:bg-[#ed1b32]/10 hover:text-[#ed1b32] transition-colors shadow-sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="mx-auto max-w-5xl space-y-6 animate-slide-up w-full">
          <div className="sm:hidden mb-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-800">
              Olá, Cliente Exemplo
            </h2>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meus Relatórios</h1>
            <p className="text-muted-foreground mt-1">
              Acesse seus painéis de dados e indicadores abaixo.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {mockWidgets.map((widget) => (
              <Card
                key={widget.id}
                className="w-full border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
              >
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-[#1268b3]/10 text-[#1268b3] shrink-0">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                      {widget.title}
                    </CardTitle>
                  </div>
                  <Button
                    asChild
                    className="w-full sm:w-auto bg-[#1268b3] hover:bg-[#1268b3]/90 text-white shadow-sm transition-all"
                  >
                    <a href={widget.url} target="_blank" rel="noopener noreferrer">
                      Abrir Relatório
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardHeader>
              </Card>
            ))}

            {mockWidgets.length === 0 && (
              <div className="text-center p-12 bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">Nenhum relatório disponível no momento.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
