import { useState, useEffect } from 'react'
import { Plus, ShieldAlert, ShieldCheck, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [newUser, setNewUser] = useState({ name: '', email: '', clientId: '' })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const [usersRes, clientsRes] = await Promise.all([
      supabase
        .from('usuarios_cliente')
        .select('*, clientes(nome)')
        .order('created_at', { ascending: false }),
      supabase.from('clientes').select('id, nome').eq('ativo', true),
    ])
    if (usersRes.data) setUsers(usersRes.data)
    if (clientsRes.data) setClients(clientsRes.data)
    setIsLoading(false)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.clientId) return
    setIsSaving(true)

    const { error } = await supabase.from('usuarios_cliente').insert({
      nome_usuario: newUser.name,
      email: newUser.email,
      cliente_id: newUser.clientId,
      ativo: true,
    })

    setIsSaving(false)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao cadastrar usuário' })
      return
    }

    toast({ title: 'Usuário cadastrado com sucesso' })
    setNewUser({ name: '', email: '', clientId: '' })
    setIsModalOpen(false)
    fetchData()
  }

  const toggleStatus = async (user: any) => {
    const { error } = await supabase
      .from('usuarios_cliente')
      .update({ ativo: !user.ativo })
      .eq('id', user.id)
    if (!error) fetchData()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('usuarios_cliente').delete().eq('id', id)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao remover usuário' })
      return
    }
    toast({ title: 'Usuário removido' })
    fetchData()
  }

  const filteredUsers =
    clientFilter === 'all' ? users : users.filter((u) => u.cliente_id === clientFilter)

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usuários</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gerencie os acessos e contas vinculadas aos clientes.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white shadow-sm transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para conceder acesso a um novo usuário.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="joao@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente Vinculado</Label>
                <Select
                  value={newUser.clientId}
                  onValueChange={(value) => setNewUser({ ...newUser, clientId: value })}
                  required
                >
                  <SelectTrigger id="client" className="w-full focus:ring-[#1268b3]">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={isSaving}
                  type="submit"
                  className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 max-w-xs">
        <Label
          htmlFor="filter-client"
          className="text-sm font-medium text-slate-600 whitespace-nowrap"
        >
          Filtrar por Cliente:
        </Label>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger id="filter-client" className="h-9 focus:ring-[#1268b3]">
            <SelectValue placeholder="Todos os Clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-semibold text-slate-900">Nome</TableHead>
              <TableHead className="font-semibold text-slate-900">Email</TableHead>
              <TableHead className="font-semibold text-slate-900">Cliente</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1268b3] mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{user.nome_usuario}</TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell className="text-slate-600">{user.clientes?.nome}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.ativo
                          ? 'bg-[#1268b3]/10 text-[#1268b3] border-[#1268b3]/20'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }
                    >
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(user)}
                        className={
                          user.ativo
                            ? 'text-[#ed1b32] hover:text-[#ed1b32] hover:bg-[#ed1b32]/10 h-8'
                            : 'text-[#1268b3] hover:text-[#1268b3] hover:bg-[#1268b3]/10 h-8'
                        }
                      >
                        {user.ativo ? (
                          <>
                            <ShieldAlert className="mr-2 h-3.5 w-3.5" />
                            Suspender
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                            Ativar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="h-8 text-[#ed1b32] hover:text-[#ed1b32] hover:bg-[#ed1b32]/10"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Deletar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
