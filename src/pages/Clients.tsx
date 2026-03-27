import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Loader2, ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { sanitizeLookerUrl } from '@/lib/utils'
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
  usuarios?: { nome_usuario: string; email: string }[]
  widgets?: { nome_relatorio: string; url_looker: string; ordem: number }[]
}

const initialData: ClientData = {
  nome: '',
  email_contato: '',
  ativo: true,
  usuarios: [],
  widgets: [],
}

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
    const { id, usuarios, widgets, ...payload } = modal.data

    try {
      if (id) {
        const { error } = await supabase.from('clientes').update(payload).eq('id', id)
        if (error) throw error
        toast({ title: 'Cliente atualizado com sucesso' })
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clientes')
          .insert(payload)
          .select()
          .single()

        if (clientError) throw clientError

        if (newClient) {
          let usersCreated = 0
          let widgetsCreated = 0

          if (usuarios && usuarios.length > 0) {
            for (const u of usuarios) {
              const senhaTemporaria = Math.random().toString(36).slice(-8)

              const { data: newUser, error: userError } = await supabase
                .from('usuarios_cliente')
                .insert({
                  cliente_id: newClient.id,
                  nome_usuario: u.nome_usuario,
                  email: u.email,
                  ativo: true,
                  email_confirmado: true,
                })
                .select()
                .single()

              if (!userError && newUser) {
                usersCreated++
                const origin = window.location.origin
                await supabase.functions.invoke('send-welcome-email', {
                  body: {
                    email: newUser.email,
                    senha_temporaria: senhaTemporaria,
                    resetUrl: `${origin}/redefinir-senha`,
                  },
                })
              }
            }
          }

          if (widgets && widgets.length > 0) {
            const widgetsToInsert = widgets.map((w) => ({
              cliente_id: newClient.id,
              nome_relatorio: w.nome_relatorio,
              url_looker: sanitizeLookerUrl(w.url_looker),
              ordem: w.ordem || 0,
              ativo: true,
            }))

            const { error: widgetsError } = await supabase.from('widgets').insert(widgetsToInsert)
            if (!widgetsError) {
              widgetsCreated = widgetsToInsert.length
            }
          }

          toast({
            title: 'Cliente criado com sucesso',
            description: `${usersCreated} usuário(s) e ${widgetsCreated} widget(s) vinculados.`,
          })
        }
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

  const addUser = () => {
    setModal((m) => ({
      ...m,
      data: {
        ...m.data,
        usuarios: [...(m.data.usuarios || []), { nome_usuario: '', email: '' }],
      },
    }))
  }

  const removeUser = (index: number) => {
    setModal((m) => {
      const newUsers = [...(m.data.usuarios || [])]
      newUsers.splice(index, 1)
      return { ...m, data: { ...m.data, usuarios: newUsers } }
    })
  }

  const updateUser = (index: number, field: string, value: string) => {
    setModal((m) => {
      const newUsers = [...(m.data.usuarios || [])]
      newUsers[index] = { ...newUsers[index], [field]: value }
      return { ...m, data: { ...m.data, usuarios: newUsers } }
    })
  }

  const addWidget = () => {
    setModal((m) => ({
      ...m,
      data: {
        ...m.data,
        widgets: [
          ...(m.data.widgets || []),
          { nome_relatorio: '', url_looker: '', ordem: (m.data.widgets?.length || 0) + 1 },
        ],
      },
    }))
  }

  const removeWidget = (index: number) => {
    setModal((m) => {
      const newWidgets = [...(m.data.widgets || [])]
      newWidgets.splice(index, 1)
      return { ...m, data: { ...m.data, widgets: newWidgets } }
    })
  }

  const updateWidget = (index: number, field: string, value: string | number) => {
    setModal((m) => {
      const newWidgets = [...(m.data.widgets || [])]
      newWidgets[index] = { ...newWidgets[index], [field]: value }
      return { ...m, data: { ...m.data, widgets: newWidgets } }
    })
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
        <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modal.mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}</DialogTitle>
            <DialogDescription>
              {modal.mode === 'create'
                ? 'Preencha os dados da empresa e configure seus acessos e relatórios iniciais.'
                : 'Edite os dados básicos da empresa.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Dados da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, email_contato: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
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
            </div>

            {modal.mode === 'create' && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-medium text-slate-900">Usuários</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addUser}>
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Usuário
                    </Button>
                  </div>
                  {!modal.data.usuarios || modal.data.usuarios.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-2">
                      Nenhum usuário adicionado.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {modal.data.usuarios.map((u, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 bg-slate-50 p-3 rounded-md border border-slate-100 relative group"
                        >
                          <div className="flex-1 space-y-2">
                            <Label>Nome Completo</Label>
                            <Input
                              value={u.nome_usuario}
                              onChange={(e) => updateUser(i, 'nome_usuario', e.target.value)}
                              required
                              placeholder="Nome do usuário"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>E-mail</Label>
                            <Input
                              type="email"
                              value={u.email}
                              onChange={(e) => updateUser(i, 'email', e.target.value)}
                              required
                              placeholder="email@exemplo.com"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUser(i)}
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white shadow-sm border text-[#ed1b32] hover:text-white hover:bg-[#ed1b32] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-medium text-slate-900">Widgets Looker</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addWidget}>
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Widget
                    </Button>
                  </div>
                  {!modal.data.widgets || modal.data.widgets.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-2">
                      Nenhum widget adicionado.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {modal.data.widgets.map((w, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-3 bg-slate-50 p-3 rounded-md border border-slate-100 relative group"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Nome do Relatório</Label>
                              <Input
                                value={w.nome_relatorio}
                                onChange={(e) => updateWidget(i, 'nome_relatorio', e.target.value)}
                                required
                                placeholder="Ex: Vendas Mensais"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Ordem</Label>
                              <Input
                                type="number"
                                value={w.ordem}
                                onChange={(e) =>
                                  updateWidget(i, 'ordem', parseInt(e.target.value) || 0)
                                }
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>URL do Looker</Label>
                            <Input
                              type="url"
                              value={w.url_looker}
                              onChange={(e) => updateWidget(i, 'url_looker', e.target.value)}
                              required
                              placeholder="https://lookerstudio.google.com/embed/reporting/..."
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWidget(i)}
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white shadow-sm border text-[#ed1b32] hover:text-white hover:bg-[#ed1b32] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModal({ open: false, mode: 'create', data: initialData })}
                disabled={isSaving}
              >
                Cancelar
              </Button>
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
