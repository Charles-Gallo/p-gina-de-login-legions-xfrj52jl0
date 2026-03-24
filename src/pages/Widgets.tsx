import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  Link as LinkIcon,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
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

type WidgetData = {
  id?: string
  nome_relatorio: string
  url_looker: string
  cliente_id: string
  ordem: number
  ativo: boolean
}

const initialData: WidgetData = {
  nome_relatorio: '',
  url_looker: '',
  cliente_id: '',
  ordem: 0,
  ativo: true,
}

export default function Widgets() {
  const [widgets, setWidgets] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; data: WidgetData }>({
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
    const [wRes, cRes] = await Promise.all([
      supabase.from('widgets').select('*, clientes(nome)').order('ordem', { ascending: true }),
      supabase.from('clientes').select('id, nome').eq('ativo', true),
    ])
    if (wRes.data) setWidgets(wRes.data)
    if (cRes.data) setClients(cRes.data)
    setIsLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modal.data.cliente_id) return
    setIsSaving(true)

    // Removemos os campos de relacionamento ou meta-dados que não devem ir no payload
    const { id, clientes, created_at, ...payload } = modal.data as any

    // Sanitiza a URL antes de salvar
    payload.url_looker = sanitizeLookerUrl(payload.url_looker)

    if (!id && payload.ordem === 0) {
      const cWidgets = widgets.filter((w) => w.cliente_id === payload.cliente_id)
      payload.ordem = cWidgets.length > 0 ? Math.max(...cWidgets.map((w) => w.ordem)) + 1 : 1
    }

    const { error } = id
      ? await supabase.from('widgets').update(payload).eq('id', id)
      : await supabase.from('widgets').insert(payload)

    setIsSaving(false)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar widget', description: error.message })
      return
    }
    toast({ title: `Widget ${id ? 'atualizado' : 'criado'} com sucesso` })
    setModal({ open: false, mode: 'create', data: initialData })
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const { error } = await supabase.from('widgets').delete().eq('id', deleteId)
    setIsDeleting(false)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao remover widget', description: error.message })
      return
    }
    toast({ title: 'Widget removido' })
    setDeleteId(null)
    fetchData()
  }

  const toggleStatus = async (widget: any) => {
    const { error } = await supabase
      .from('widgets')
      .update({ ativo: !widget.ativo })
      .eq('id', widget.id)
    if (!error) fetchData()
  }

  const filteredWidgets =
    clientFilter === 'all' ? widgets : widgets.filter((w) => w.cliente_id === clientFilter)

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Widgets Looker</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gerencie URLs de relatórios dos clientes.
          </p>
        </div>
        <Button
          onClick={() => setModal({ open: true, mode: 'create', data: initialData })}
          className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Widget
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
              <TableHead className="w-[60px] text-center font-semibold text-slate-900">
                Ordem
              </TableHead>
              <TableHead className="font-semibold text-slate-900">Cliente</TableHead>
              <TableHead className="font-semibold text-slate-900">Relatório</TableHead>
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
            ) : filteredWidgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum widget encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredWidgets.map((widget) => (
                <TableRow key={widget.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-center font-medium text-slate-700">
                    {widget.ordem}
                  </TableCell>
                  <TableCell className="text-slate-600">{widget.clientes?.nome}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{widget.nome_relatorio}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 max-w-[200px] md:max-w-[300px] truncate">
                      <LinkIcon className="h-3 w-3 shrink-0" /> {widget.url_looker}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        widget.ativo
                          ? 'bg-[#1268b3]/10 text-[#1268b3] border-[#1268b3]/20'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }
                    >
                      {widget.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(widget)}
                        className={widget.ativo ? 'text-[#ed1b32]' : 'text-[#1268b3]'}
                        title={widget.ativo ? 'Suspender' : 'Ativar'}
                      >
                        {widget.ativo ? (
                          <ShieldAlert className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setModal({ open: true, mode: 'edit', data: widget })}
                        className="text-slate-600 hover:text-[#1268b3]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(widget.id)}
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
            <DialogTitle>{modal.mode === 'create' ? 'Novo Widget' : 'Editar Widget'}</DialogTitle>
            <DialogDescription>Preencha os dados do relatório.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Relatório</Label>
              <Input
                id="name"
                value={modal.data.nome_relatorio}
                onChange={(e) =>
                  setModal((m) => ({ ...m, data: { ...m.data, nome_relatorio: e.target.value } }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL do Looker</Label>
              <Input
                id="url"
                type="url"
                value={modal.data.url_looker}
                onChange={(e) =>
                  setModal((m) => ({ ...m, data: { ...m.data, url_looker: e.target.value } }))
                }
                placeholder="https://lookerstudio.google.com/embed/reporting/..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={modal.data.ordem}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      data: { ...m.data, ordem: parseInt(e.target.value) || 0 },
                    }))
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
        title="Excluir Widget"
        description="Tem certeza que deseja excluir este widget? O relatório não estará mais disponível para o cliente."
      />
    </div>
  )
}
