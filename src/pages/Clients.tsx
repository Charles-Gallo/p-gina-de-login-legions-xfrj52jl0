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

type ClientData = {
  id?: string
  nome: string
  email_contato: string
  ativo: boolean
}
const initialData: ClientData = { nome: '', email_contato: '', ativo: true }

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; data: ClientData }>({
    open: false,
    mode: 'create',
    data: initialData,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setClients(data)
    setIsLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const { id, ...payload } = modal.data

    try {
      if (id) {
        const { error } = await supabase.from('clientes').update(payload).eq('id', id)
        if (error) throw error
        toast({ title: 'Cliente atualizado com sucesso' })
      } else {
        const { error } = await supabase.from('clientes').insert(payload)
        if (error) throw error
        toast({ title: 'Cliente criado com sucesso' })
      }
      setModal({ open: false, mode: 'create', data: initialData })
      fetchClients()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar cliente', description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const { error } = await supabase.from('clientes').delete().eq('id', deleteId)
    setIsDeleting(false)
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover cliente',
        description: error.message,
      })
      return
    }
    toast({ title: 'Cliente removido' })
    setDeleteId(null)
    fetchClients()
  }

  const toggleStatus = async (client: any) => {
    const { error } = await supabase
      .from('clientes')
      .update({ ativo: !client.ativo })
      .eq('id', client.id)
    if (!error) fetchClients()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gerencie os dados cadastrais das empresas.
          </p>
        </div>
        <Button
          onClick={() => setModal({ open: true, mode: 'create', data: initialData })}
          className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-semibold text-slate-900">Nome</TableHead>
              <TableHead className="font-semibold text-slate-900">E-mail de Contato</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="font-semibold text-slate-900">Data de Cadastro</TableHead>
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
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{client.nome}</TableCell>
                  <TableCell className="text-slate-600">{client.email_contato}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        client.ativo
                          ? 'bg-[#1268b3]/10 text-[#1268b3] border-[#1268b3]/20'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }
                    >
                      {client.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(client.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(client)}
                        className={client.ativo ? 'text-[#ed1b32]' : 'text-[#1268b3]'}
                        title={client.ativo ? 'Suspender' : 'Ativar'}
                      >
                        {client.ativo ? (
                          <ShieldAlert className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setModal({ open: true, mode: 'edit', data: client })}
                        className="text-slate-600 hover:text-[#1268b3]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(client.id)}
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
            <DialogTitle>{modal.mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}</DialogTitle>
            <DialogDescription>
              Preencha os dados da empresa. O acesso ao sistema deve ser criado na tela de Usuários.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                value={modal.data.nome}
                onChange={(e) =>
                  setModal((m) => ({ ...m, data: { ...m.data, nome: e.target.value } }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Contato</Label>
              <Input
                id="email"
                type="email"
                value={modal.data.email_contato}
                onChange={(e) =>
                  setModal((m) => ({ ...m, data: { ...m.data, email_contato: e.target.value } }))
                }
                required
              />
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
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Todos os usuários e widgets vinculados serão perdidos."
      />
    </div>
  )
}
