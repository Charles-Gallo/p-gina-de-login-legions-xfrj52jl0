import { useEffect, useState } from 'react'
import { Users, UserCog, Box, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, users: 0, widgets: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      // Mudamos 'head: true' para 'head: false' e adicionamos '.limit(0)'
      // Isso evita o erro de JSON vazio e continua sendo super rápido.
      const [cRes, uRes, wRes] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: false }).limit(0),
        supabase.from('usuarios_cliente').select('*', { count: 'exact', head: false }).limit(0),
        supabase.from('widgets').select('*', { count: 'exact', head: false }).limit(0),
      ])

      setStats({
        clients: cRes.count || 0,
        users: uRes.count || 0,
        widgets: wRes.count || 0,
      })
      setIsLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total de Clientes',
      value: stats.clients,
      icon: Users,
      color: 'text-[#1268b3]',
    },
    {
      title: 'Total de Usuários',
      value: stats.users,
      icon: UserCog,
      color: 'text-[#1268b3]',
    },
    {
      title: 'Total de Widgets',
      value: stats.widgets,
      icon: Box,
      color: 'text-[#ed1b32]',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Visão geral do sistema e indicadores de desempenho.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1268b3]" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card
                key={i}
                className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md bg-slate-50/50 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-slate-900 tracking-tight">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
