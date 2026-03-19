import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ExternalLink, BarChart3, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomerDashboard() {
  const { isAuthenticated, role, signOut, loading, customerData } = useAuth()
  const [widgets, setWidgets] = useState<any[]>([])
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== 'customer')) {
      navigate('/entrar', { replace: true })
    }
  }, [loading, isAuthenticated, role, navigate])

  useEffect(() => {
    if (customerData?.cliente_id) {
      setIsLoadingWidgets(true)
      supabase
        .from('widgets')
        .select('*')
        .eq('cliente_id', customerData.cliente_id)
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .then(({ data }) => {
          setWidgets(data || [])
          setIsLoadingWidgets(false)
        })
    }
  }, [customerData])

  const handleLogout = async () => {
    await signOut()
    navigate('/entrar')
  }

  if (loading || !isAuthenticated || role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#1268b3]" />
      </div>
    )
  }

  const clientName = customerData?.clientes?.nome || 'Cliente'
  const userName = customerData?.nome_usuario || 'Usuário'

  return (
    <div className="w-full h-full flex flex-col absolute inset-0 bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo className="scale-75 origin-left" />
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-sm font-medium text-slate-700">
            Olá, {userName}
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
            <h2 className="text-xl font-semibold tracking-tight text-slate-800">Olá, {userName}</h2>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Meus Relatórios - {clientName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Acesse seus painéis de dados e indicadores abaixo.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {isLoadingWidgets ? (
              <div className="flex justify-center p-12 bg-white rounded-lg border border-slate-200">
                <Loader2 className="h-8 w-8 animate-spin text-[#1268b3]" />
              </div>
            ) : widgets.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">Nenhum relatório disponível no momento.</p>
              </div>
            ) : (
              widgets.map((widget) => (
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
                        {widget.nome_relatorio}
                      </CardTitle>
                    </div>
                    <Button
                      asChild
                      className="w-full sm:w-auto bg-[#1268b3] hover:bg-[#1268b3]/90 text-white shadow-sm transition-all"
                    >
                      <a href={widget.url_looker} target="_blank" rel="noopener noreferrer">
                        Abrir Relatório
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
