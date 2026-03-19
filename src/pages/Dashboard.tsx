import { Users, UserCog, Box } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const stats = [
    {
      title: 'Total de Clientes',
      value: '1.284',
      icon: Users,
      color: 'text-[#1268b3]',
    },
    {
      title: 'Total de Usuários',
      value: '45',
      icon: UserCog,
      color: 'text-[#1268b3]',
    },
    {
      title: 'Total de Widgets',
      value: '328',
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

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, i) => {
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
                <div className="text-4xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
