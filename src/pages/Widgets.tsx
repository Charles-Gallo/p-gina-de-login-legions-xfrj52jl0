import { useState, useEffect } from 'react'
import { Plus, Link as LinkIcon, GripVertical, Trash2, Loader2 } from 'lucide-react'
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

export default function Widgets() {
  const [widgets, setWidgets] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [newWidget, setNewWidget] = useState({ name: '', url: '', clientId: '' })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const [widgetsRes, clientsRes] = await Promise.all([
      supabase.from('widgets').select('*, clientes(nome)').order('ordem', { ascending: true }),
      supabase.from('clientes').select('id, nome').eq('ativo', true),
    ])
    if (widgetsRes.data) setWidgets(widgetsRes.data)
    if (clientsRes.data) setClients(clientsRes.data)
    setIsLoading(false)
  }

  const handleCreateWidget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWidget.clientId) return
    setIsSaving(true)

    const clientWidgets = widgets.filter((w) => w.cliente_id === newWidget.clientId)
    const nextOrder =
      clientWidgets.length > 0 ? Math.max(...clientWidgets.map((w) => w.ordem)) + 1 : 1

    const { error } = await supabase.from('widgets').insert({
      nome_relatorio: newWidget.name,
      url_looker: newWidget.url,
      cliente_id: newWidget.clientId,
      ordem: nextOrder,
      ativo: true,
    })

    setIsSaving(false)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao cadastrar widget' })
      return
    }

    toast({ title: 'Widget cadastrado com sucesso' })
    setNewWidget({ name: '', url: '', clientId: '' })
    setIsModalOpen(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('widgets').delete().eq('id', id)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao remover widget' })
      return
    }
    toast({ title: 'Widget removido' })
    fetchData()
  }

  const filteredWidgets =
    clientFilter === 'all' ? widgets : widgets.filter((w) => w.cliente_id === clientFilter)

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Widgets Looker</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gerencie e organize os URLs de relatórios para cada cliente.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white shadow-sm transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Novo Widget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Widget</DialogTitle>
              <DialogDescription>
                Adicione um novo relatório Looker e vincule a um cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWidget} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Relatório</Label>
                <Input
                  id="name"
                  value={newWidget.name}
                  onChange={(e) => setNewWidget({ ...newWidget, name: e.target.value })}
                  placeholder="Ex: Resultados de Vendas Q3"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL do Looker</Label>
                <Input
                  id="url"
                  type="url"
                  value={newWidget.url}
                  onChange={(e) => setNewWidget({ ...newWidget, url: e.target.value })}
                  placeholder="https://lookerstudio.google.com/..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={newWidget.clientId}
                  onValueChange={(value) => setNewWidget({ ...newWidget, clientId: value })}
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
              <TableHead className="w-[60px] text-center font-semibold text-slate-900">
                Ordem
              </TableHead>
              <TableHead className="font-semibold text-slate-900">Cliente</TableHead>
              <TableHead className="font-semibold text-slate-900">Nome do Relatório</TableHead>
              <TableHead className="font-semibold text-slate-900">URL do Looker</TableHead>
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
                  {clientFilter === 'all'
                    ? 'Nenhum widget cadastrado.'
                    : 'Nenhum widget encontrado para este cliente.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredWidgets.map((widget) => (
                <TableRow key={widget.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-400">
                      <GripVertical className="h-4 w-4 cursor-grab hover:text-slate-600" />
                      <span className="font-medium text-slate-700">{widget.ordem}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{widget.clientes?.nome}</TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {widget.nome_relatorio}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-2 max-w-[300px] md:max-w-[400px]">
                      <LinkIcon className="h-3.5 w-3.5 shrink-0 text-[#1268b3]" />
                      <a
                        href={widget.url_looker}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-[#1268b3] hover:underline transition-colors"
                        title={widget.url_looker}
                      >
                        {widget.url_looker}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(widget.id)}
                      className="h-8 text-[#ed1b32] hover:text-[#ed1b32] hover:bg-[#ed1b32]/10"
                      title="Remover Widget"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remover</span>
                    </Button>
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
