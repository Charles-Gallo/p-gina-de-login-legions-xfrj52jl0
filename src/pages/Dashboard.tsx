import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, LayoutDashboard, Box, UserCog, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'

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

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, isActive: true },
    { title: 'Clientes', icon: Users, isActive: false },
    { title: 'Usuários', icon: UserCog, isActive: false },
    { title: 'Widgets', icon: Box, isActive: false },
  ]

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
    <SidebarProvider className="absolute inset-0 z-50 bg-slate-50">
      <Sidebar className="border-r border-slate-200" collapsible="icon">
        <SidebarContent className="pt-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Menu de Navegação
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={item.isActive}
                      tooltip={item.title}
                      className={
                        item.isActive
                          ? 'bg-[#1268b3]/10 text-[#1268b3] hover:bg-[#1268b3]/20 hover:text-[#1268b3]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    >
                      <item.icon />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-200 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Sair do Sistema"
                className="text-[#ed1b32] hover:text-[#ed1b32] hover:bg-[#ed1b32]/10 transition-colors"
              >
                <LogOut />
                <span className="font-medium">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-slate-50 flex flex-col min-h-screen w-full">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-900 transition-colors" />
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />
            <Logo className="scale-75 origin-left" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-900 leading-none">
                Administrador
              </span>
              <span className="text-xs text-muted-foreground mt-1">admin@legions.com</span>
            </div>
            <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
              <AvatarImage
                src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=admin"
                alt="Administrador"
              />
              <AvatarFallback className="bg-[#1268b3]/10 text-[#1268b3] font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
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
                      <div className="text-4xl font-bold text-slate-900 tracking-tight">
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
