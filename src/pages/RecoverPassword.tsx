import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RecoverPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const { error } = await supabase.functions.invoke('send-reset-email', {
        body: {
          email,
          redirectTo: `${window.location.origin}/redefinir-senha`,
        },
      })

      if (error) {
        console.error('Recover Password Error:', error)
      }
    } catch (err) {
      console.error('Recover Password Exception:', err)
    } finally {
      setIsLoading(false)
      // Always show success message to prevent email enumeration attacks
      toast({
        title: 'Se este e-mail estiver cadastrado, você receberá um link em breve',
      })
      navigate('/entrar')
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <Card className="border-slate-200 shadow-md transition-all duration-300">
        <CardHeader className="space-y-4 pb-8 items-center text-center">
          <Logo className="mb-2" />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">Recuperar Senha</CardTitle>
            <CardDescription className="text-sm">
              Enviaremos um link de recuperação para o seu e-mail
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                E-mail Cadastrado
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

            <Button
              type="submit"
              className="w-full bg-[#1268b3] hover:bg-[#1268b3]/90 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-11 shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperação'
              )}
            </Button>

            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                asChild
                className="text-muted-foreground hover:text-slate-900"
                disabled={isLoading}
              >
                <Link to="/entrar">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o login
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
