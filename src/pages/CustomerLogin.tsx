import { useState } from 'react'
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

export default function CustomerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasError(false)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !password || !emailRegex.test(email)) {
      setHasError(true)
      toast({
        variant: 'destructive',
        title: 'Credenciais inválidas',
        description: 'Por favor, verifique seus dados e tente novamente.',
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      // Mock validation success if password is at least 3 chars
      if (password.length >= 3) {
        login()
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo ao seu portal de cliente.',
        })
        navigate('/dashlgn')
      } else {
        setHasError(true)
        toast({
          variant: 'destructive',
          title: 'Credenciais inválidas',
          description: 'A senha incorreta. Tente novamente.',
        })
      }
    }, 1200)
  }

  return (
    <div className="w-full max-w-[400px]">
      <Card
        className={cn(
          'border-slate-200 shadow-md transition-all duration-300',
          hasError && 'animate-shake border-[#ed1b32]/50 ring-1 ring-[#ed1b32]/20',
        )}
      >
        <CardHeader className="space-y-4 pb-8 items-center text-center">
          <Logo className="mb-2" />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Portal do Cliente
            </CardTitle>
            <CardDescription className="text-sm">
              Acesse sua conta para gerenciar seus serviços
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
                className="transition-colors focus-visible:ring-[#1268b3]"
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
                  className="pr-10 transition-colors focus-visible:ring-[#1268b3]"
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
              className="w-full bg-[#1268b3] hover:bg-[#1268b3]/90 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-11 shadow-sm"
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
