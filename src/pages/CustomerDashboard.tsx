import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ExternalLink, BarChart3, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { getLookerUrls } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomerDashboard() {
  const { isAuthenticated, role, signOut, loading, customerData } = useAuth()
  const [widgets, setWidgets] = useState<any[]>([])
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Only redirect if auth loading is completely finished
    if (!loading && (!isAuthenticated || role !== 'cliente')) {
      navigate('/entrar', { replace: true })
    }
  }, [loading, isAuthenticated, role, navigate])

  const clienteId = customerData?.cliente_id
  const hasCustomerData = !!customerData

  useEffect(() => {
    let isMounted = true

    if (clienteId) {
      setIsLoadingWidgets(true)
      supabase
        .from('widgets')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .then(({ data, error }) => {
          if (!isMounted) return

          if (error) {
            toast({
              variant: 'destructive',
              title: 'Erro ao carregar relatórios',
              description: 'Ocorreu um problema ao buscar os dados do seu dashboard.',
            })
            setWidgets([])
          } else {
            setWidgets(data || [])
          }
          setIsLoadingWidgets(false)
        })
    } else if (hasCustomerData && !clienteId) {
      if (isMounted) {
        toast({
          variant: 'destructive',
          title: 'Erro de configuração',
          description: 'Não foi possível encontrar o cliente associado à sua conta.',
        })
        setIsLoadingWidgets(false)
      }
    } else {
      if (isMounted) {
        setIsLoadingWidgets(false)
      }
    }

    return () => {
      isMounted = false
    }
  }, [clienteId, hasCustomerData, toast])

  const handleLogout = async () => {
    await signOut()
    navigate('/entrar')
  }

  if (loading || !isAuthenticated || role !== 'cliente') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 w-full h-full absolute inset-0">
        <Loader2 className="h-8 w-8 animate-spin text-[#1268b3]" />
      </div>
    )
  }

  const clientName = customerData?.clientes?.nome || 'Cliente'
  const userName = customerData?.nome_usuario || 'Usuário'

  return (
    <div className="w-full h-full flex flex-col absolute inset-0 bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
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
        <div className="mx-auto max-w-[1400px] space-y-6 animate-slide-up w-full h-full flex flex-col">
          <div className="sm:hidden shrink-0 mb-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-800">Olá, {userName}</h2>
          </div>

          <div className="shrink-0">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Meus Relatórios - {clientName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Acesse seus painéis de dados e indicadores abaixo.
            </p>
          </div>

          <div className="flex flex-col gap-8 w-full flex-1">
            {isLoadingWidgets ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-[#1268b3]" />
              </div>
            ) : widgets.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm">
                <p className="text-slate-500">Nenhum relatório disponível no momento.</p>
              </div>
            ) : (
              widgets.map((widget) => {
                const { embedUrl, externalUrl } = getLookerUrls(widget.url_looker)

                return (
                  <Card
                    key={widget.id}
                    className="w-full border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col h-[calc(100vh-250px)] min-h-[600px]"
                  >
                    <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-slate-100 bg-slate-50/50 shrink-0 space-y-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-[#1268b3]/10 text-[#1268b3] shrink-0">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                          {widget.nome_relatorio}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-[#1268b3] hover:text-[#1268b3] hover:bg-[#1268b3]/10 transition-colors"
                      >
                        <a
                          href={externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir relatório em nova guia"
                        >
                          <span className="hidden sm:inline-block mr-2">Abrir Nova Guia</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardHeader>
                    <div className="w-full flex-1 bg-slate-100 relative">
                      {/* Looker Studio recommended iframe configuration */}
                      <iframe
                        src={embedUrl}
                        className="w-full h-full border-0 absolute inset-0"
                        allowFullScreen
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        title={widget.nome_relatorio}
                        loading="lazy"
                      />
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
