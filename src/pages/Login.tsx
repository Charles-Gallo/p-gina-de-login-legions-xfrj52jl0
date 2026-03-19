import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Shield, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar',
        description: 'Credenciais inválidas. Verifique seu e-mail e senha.',
      })
    } else {
      navigate('/admlgn')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-[#1268b3] p-2 rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-4xl font-extrabold tracking-tight text-[#1268b3]">Legions</span>
          </div>
        </div>

        <Card className="border-t-4 border-t-[#1268b3] shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Login Administrativo
            </CardTitle>
            <CardDescription className="text-slate-500">
              Acesse o painel de controle da Legions
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@legions.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus-visible:ring-[#1268b3] border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700">
                    Senha
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus-visible:ring-[#1268b3] border-slate-200"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#1268b3] hover:bg-[#1268b3]/90 text-white font-semibold py-5"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Entrar
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
