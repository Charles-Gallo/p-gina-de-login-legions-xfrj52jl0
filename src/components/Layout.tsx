import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'

export default function Layout() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-background selection:bg-[#1268b3]/20 transition-colors duration-300">
        <main className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>

        <footer className="py-6 text-center text-sm text-muted-foreground bg-white/50 backdrop-blur-sm border-t">
          <p>© {new Date().getFullYear()} Legions. Todos os direitos reservados.</p>
        </footer>
      </div>
    </AuthProvider>
  )
}
