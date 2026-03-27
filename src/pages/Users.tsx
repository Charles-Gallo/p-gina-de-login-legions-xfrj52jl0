import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'

type UserData = {
  id?: string
  nome_usuario: string
  email: string
  cliente_id: string
  ativo: boolean
  senha?: string
}
const initialData: UserData = {
  nome_usuario: '',
  email: '',
  cliente_id: '',
  ativo: true,
  senha: '',
}

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; data: UserData }>({
    open: false,
    mode: 'create',
    data: initialData,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const [uRes, cRes] = await Promise.all([
      supabase
        .from('usuarios_cliente')
        .select('*, clientes(nome)')
        .order('created_at', { ascending: false }),
      supabase.from('clientes').select('id, nome').eq('ativo', true),
    ])
    if (uRes.data) setUsers(uRes.data)
    if (cRes.data) setClients(cRes.data)
    setIsLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modal.data.cliente_id) return
    setIsSaving(true)
    const { id, senha, ...payload } = modal.data

    let error = null
    let newRecord = null

    if (id) {
      const { error: updateError } = await supabase
        .from('usuarios_cliente')
        .update(payload)
        .eq('id', id)
      error = updateError
    } else {
      const { data, error: insertError } = await supabase
        .from('usuarios_cliente')
        .insert({
          ...payload,
          email_confirmado: true,
          token_confirmacao: null,
        })
        .select()
        .single()
      error = insertError
      newRecord = data
    }

    if (error) {
      setIsSaving(false)
      toast({ variant: 'destructive', title: 'Erro ao salvar usuário', description: error.message })
      return
    }

    if (!id && newRecord) {
      const senhaTemporaria = senha || Math.random().toString(36).slice(-8)
      const origin = window.location.origin

      const { error: invokeError } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: newRecord.email,
          senha_temporaria: senhaTemporaria,
          resetUrl: `${origin}/redefinir-senha`,
        },
      })

      setIsSaving(false)

      if (invokeError) {
        toast({
          variant: 'destructive',
          title: 'Aviso',
          description:
            'Usuário criado, mas houve um erro ao enviar o e-mail de boas-vindas. Por favor, verifique as configurações do Resend.',
        })
      } else {
        toast({
          title: 'Sucesso',
          description: 'Usuário criado e e-mail de boas-vindas enviado com sucesso.',
        })
      }
    } else {
      setIsSaving(false)
      toast({ title: 'Usuário atualizado com sucesso' })
    }

    setModal({ open: false, mode: 'create', data: initialData })
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    // A deleção na tabela usuarios_cliente dispara automaticamente o trigger no banco
    // que apaga também o registro correspondente na tabela auth.users.
    const { error } = await supabase.from('usuarios_cliente').delete().eq('id', deleteId)

    setIsDeleting(false)
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover usuário',
        description: error.message,
      })
      return
    }

    toast({
      title: 'Usuário removido com sucesso',
      description:
        'O perfil e as credenciais de acesso foram excluídos permanentemente de todos os registros.',
    })

    setDeleteId(null)
    fetchData()
  }

  const toggleStatus = async (user: any) => {
    const { error } = await supabase
      .from('usuarios_cliente')
      .update({ ativo: !user.ativo })
      .eq('id', user.id)
    if (!error) fetchData()
  }

  const filteredUsers =
    clientFilter === 'all' ? users : users.filter((u) => u.cliente_id === clientFilter)

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usuários</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gerencie as credenciais e acessos vinculados aos clientes.
          </p>
        </div>
        <Button
          onClick={() => setModal({ open: true, mode: 'create', data: initialData })}
          className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-xs">
        <Label
          htmlFor="filter-client"
          className="text-sm font-medium text-slate-600 whitespace-nowrap"
        >
          Filtrar:
        </Label>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger id="filter-client" className="h-9 focus:ring-[#1268b3]">
            <SelectValue placeholder="Todos os Clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
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
              <TableHead className="font-semibold text-slate-900">Cliente (Empresa)</TableHead>
              <TableHead className="font-semibold text-slate-900 text-center">
                Confirmação
              </TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1268b3] mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{user.nome_usuario}</TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell className="text-slate-600">{user.clientes?.nome}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        user.email_confirmado
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50'
                      }
                    >
                      {user.email_confirmado ? 'Confirmado' : 'Pendente'}
                    </Badge>
                  </TableCell>
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
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(user)}
                        className={user.ativo ? 'text-[#ed1b32]' : 'text-[#1268b3]'}
                        title={user.ativo ? 'Suspender' : 'Ativar'}
                      >
                        {user.ativo ? (
                          <ShieldAlert className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setModal({ open: true, mode: 'edit', data: user })}
                        className="text-slate-600 hover:text-[#1268b3]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(user.id)}
                        className="text-slate-600 hover:text-[#ed1b32]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modal.open} onOpenChange={(open) => setModal((m) => ({ ...m, open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modal.mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}</DialogTitle>
            <DialogDescription>Preencha os dados do usuário para acesso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={modal.data.nome_usuario}
                onChange={(e) =>
                  setModal((m) => ({ ...m, data: { ...m.data, nome_usuario: e.target.value } }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={modal.data.email}
                onChange={(e) =>
                  setModal((m) => ({ ...m, data: { ...m.data, email: e.target.value } }))
                }
                required
              />
            </div>
            {modal.mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="senha">Senha Inicial</Label>
                <Input
                  id="senha"
                  type="text"
                  value={modal.data.senha}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, data: { ...m.data, senha: e.target.value } }))
                  }
                  required={modal.mode === 'create'}
                  minLength={6}
                  placeholder="Ex: senhaSegura123"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="client">Vincular a Qual Cliente?</Label>
              <Select
                value={modal.data.cliente_id}
                onValueChange={(val) =>
                  setModal((m) => ({ ...m, data: { ...m.data, cliente_id: val } }))
                }
                required
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={modal.data.ativo ? 'true' : 'false'}
                onValueChange={(val) =>
                  setModal((m) => ({ ...m, data: { ...m.data, ativo: val === 'true' } }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                disabled={isSaving}
                type="submit"
                className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Excluir Usuário"
        description="Tem certeza que deseja excluir este usuário? O acesso dele será revogado permanentemente e não poderá ser recuperado."
      />
    </div>
  )
}
