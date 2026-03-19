import { useEffect } from 'react'
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom'
import { Users, LayoutDashboard, Box, UserCog, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
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

export default function AdminLayout() {
  const { isAuthenticated, role, signOut, loading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== 'admin')) {
      navigate('/adm/login', { replace: true })
    }
  }, [loading, isAuthenticated, role, navigate])

  const handleLogout = async () => {
    await signOut()
    navigate('/adm/login')
  }

  if (loading || !isAuthenticated || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#1268b3]" />
      </div>
    )
  }

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/admlgn' },
    { title: 'Clientes', icon: Users, path: '/admlgn/clientes' },
    { title: 'Usuários', icon: UserCog, path: '/admlgn/usuarios' },
    { title: 'Widgets', icon: Box, path: '/admlgn/widgets' },
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
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={
                          isActive
                            ? 'bg-[#1268b3]/10 text-[#1268b3] hover:bg-[#1268b3]/20 hover:text-[#1268b3]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }
                      >
                        <Link to={item.path}>
                          <item.icon />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
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
              <span className="text-xs text-muted-foreground mt-1">
                {user?.email || 'admin@legions.com'}
              </span>
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
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
