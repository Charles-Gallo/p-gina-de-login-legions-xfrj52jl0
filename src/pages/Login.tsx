import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const { signIn, role, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && role === 'admin') {
      navigate('/admlgn', { replace: true })
    }
  }, [role, loading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasError(false)

    if (!email || !password) {
      setHasError(true)
      return
    }

    setIsLoading(true)
    const { error, role: userRole } = await signIn(email, password)
    setIsLoading(false)

    if (error) {
      setHasError(true)
      toast({
        variant: 'destructive',
        title: 'Credenciais inválidas',
        description: 'Verifique seus dados e tente novamente.',
      })
    } else if (userRole !== 'admin') {
      setHasError(true)
      await signOut()
      toast({
        variant: 'destructive',
        title: 'Acesso negado',
        description: 'Acesso restrito apenas para administradores',
      })
    } else {
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao painel administrativo.',
      })
      navigate('/admlgn')
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <Card
        className={cn(
          'border-slate-200 shadow-md transition-all duration-300',
          hasError && 'animate-shake border-destructive/50 ring-1 ring-destructive/20',
        )}
      >
        <CardHeader className="space-y-4 pb-8 items-center text-center">
          <Logo className="mb-2" />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-sm">
              Insira suas credenciais para continuar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="transition-colors focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Senha
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10 transition-colors focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-11 shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
