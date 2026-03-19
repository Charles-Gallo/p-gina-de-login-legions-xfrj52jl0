import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        if (mounted) setIsReady(true)
      } else {
        // If there's no hash with access token, the link is likely invalid
        if (!window.location.hash) {
          if (mounted) setErrorMsg('Link de recuperação inválido ou expirado.')
        }
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || session) && mounted) {
        setIsReady(true)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'As senhas não coincidem' })
      return
    }

    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'A senha deve ter pelo menos 6 caracteres' })
      return
    }

    setIsLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setIsLoading(false)
      toast({
        variant: 'destructive',
        title: 'Erro ao redefinir senha',
        description: error.message,
      })
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role

    await supabase.auth.signOut()

    toast({ title: 'Senha alterada com sucesso!' })

    if (role === 'admin') {
      navigate('/adm/login')
    } else {
      navigate('/entrar')
    }
  }

  if (errorMsg) {
    return (
      <div className="w-full max-w-[400px]">
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="space-y-4 pb-8 items-center text-center">
            <Logo className="mb-2" />
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight text-[#ed1b32]">
                Acesso Expirado
              </CardTitle>
              <CardDescription>{errorMsg}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/recuperar-senha')}
            >
              Solicitar novo link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="w-full max-w-[400px] flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1268b3]" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[400px]">
      <Card className="border-slate-200 shadow-md transition-all duration-300">
        <CardHeader className="space-y-4 pb-8 items-center text-center">
          <div className="h-12 w-12 bg-[#1268b3]/10 text-[#1268b3] rounded-full flex items-center justify-center mb-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">Redefinir Senha</CardTitle>
            <CardDescription className="text-sm">
              Crie uma nova senha segura para sua conta
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Nova Senha
              </Label>
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
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="transition-colors focus-visible:ring-[#1268b3]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1268b3] hover:bg-[#1268b3]/90 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-11 shadow-sm mt-4"
              disabled={isLoading || password.length < 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar Nova Senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
