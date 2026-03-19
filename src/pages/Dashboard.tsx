import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, Activity, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Dashboard() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/adm/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    navigate('/adm/login')
  }

  if (!isAuthenticated) return null

  const stats = [
    {
      title: 'Usuários Ativos',
      value: '2.543',
      icon: Users,
      description: '+12% desde o último mês',
      color: 'text-blue-500',
    },
    {
      title: 'Relatórios Pendentes',
      value: '14',
      icon: FileText,
      description: '4 requerem atenção urgente',
      color: 'text-red-500',
    },
    {
      title: 'Logs do Sistema',
      value: '8.192',
      icon: Activity,
      description: 'Sistema operando normalmente',
      color: 'text-green-500',
    },
  ]

  return (
    <div className="w-full h-full flex flex-col absolute inset-0 bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo className="scale-75 origin-left" />
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarImage
                    src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=admin"
                    alt="Admin"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Administrador</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@legions.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Painel de Controle</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Bem-vindo, Administrador
            </h1>
            <p className="text-muted-foreground mt-1">
              Aqui está o resumo das atividades do sistema Legions hoje.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <Card
                  key={i}
                  className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Placeholder for additional content to make the dashboard look complete */}
          <div className="mt-8">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 py-3 border-b last:border-0 last:pb-0"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Novo usuário registrado na plataforma</p>
                        <p className="text-xs text-muted-foreground">Há {i * 15} minutos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
