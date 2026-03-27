import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Logo } from '@/components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signIn, isAuthenticated, role, loading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && isAuthenticated && role === 'admin') {
      navigate('/admlgn', { replace: true })
    }
  }, [isAuthenticated, role, loading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error, role: userRole } = await signIn(email, password)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao entrar',
          description: 'E-mail ou senha incorretos.',
        })
        return
      }

      if (userRole === 'admin') {
        toast({
          title: 'Bem-vindo!',
          description: 'Login de administrador realizado com sucesso.',
        })
        navigate('/admlgn', { replace: true })
      } else {
        toast({
          variant: 'destructive',
          title: 'Acesso negado',
          description: 'Você não tem permissões de administrador.',
        })
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao tentar fazer login.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 absolute inset-0">
        <Loader2 className="h-8 w-8 animate-spin text-[#1268b3]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 absolute inset-0">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo className="scale-125 mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Portal do Administrador
          </h1>
          <p className="text-muted-foreground">
            Entre com suas credenciais para acessar o painel de controle.
          </p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold">Login</CardTitle>
              <CardDescription>Digite seu e-mail e senha corporativos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@legions.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus-visible:ring-[#1268b3]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus-visible:ring-[#1268b3]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#1268b3] hover:bg-[#1268b3]/90 text-white transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar no Painel'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
