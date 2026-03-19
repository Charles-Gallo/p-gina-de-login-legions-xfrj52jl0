import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import CustomerLogin from './pages/CustomerLogin'
import CustomerDashboard from './pages/CustomerDashboard'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/adm/login" element={<Login />} />
          <Route path="/entrar" element={<CustomerLogin />} />
          <Route path="/dashlgn" element={<CustomerDashboard />} />

          <Route element={<AdminLayout />}>
            <Route path="/admlgn" element={<Dashboard />} />
            <Route path="/admlgn/clientes" element={<Clients />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
