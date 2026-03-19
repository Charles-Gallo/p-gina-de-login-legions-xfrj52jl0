import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    const verifyToken = async () => {
      try {
        const { data, error } = await supabase.rpc('confirmar_email_usuario', { p_token: token })

        if (error || !data) {
          console.error('Error confirming email:', error)
          setStatus('error')
        } else {
          setStatus('success')
        }
      } catch (err) {
        console.error('Exception confirming email:', err)
        setStatus('error')
      }
    }

    verifyToken()
  }, [token])

  return (
    <div className="w-full max-w-[400px] animate-fade-in-up">
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="space-y-4 pb-6 items-center text-center">
          <Logo className="mb-2" />
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Confirmação de E-mail
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-[#1268b3]" />
              <p className="text-sm text-muted-foreground text-center">
                Verificando seu token de confirmação...
              </p>
            </>
          )}

          {status === 'success' && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <Alert className="bg-green-50 border-green-200 w-full mb-6">
                <AlertTitle className="text-green-800">E-mail Confirmado!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Sua conta foi verificada com sucesso. Você já pode acessar a plataforma.
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full bg-[#1268b3] hover:bg-[#1268b3]/90 text-white">
                <Link to="/entrar">
                  Ir para o Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-8 w-8" />
              </div>
              <Alert variant="destructive" className="w-full mb-6">
                <AlertTitle>Link Inválido ou Expirado</AlertTitle>
                <AlertDescription>
                  Não foi possível confirmar seu e-mail. O link pode ter expirado ou já ter sido
                  utilizado.
                </AlertDescription>
              </Alert>
              <Button asChild variant="outline" className="w-full">
                <Link to="/entrar">Voltar ao Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
