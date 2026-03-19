import { useState } from 'react'
import { Plus, Link as LinkIcon, GripVertical, Trash2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

const mockClients = [
  { id: '1', name: 'Empresa Alpha' },
  { id: '2', name: 'Tech Solutions' },
  { id: '3', name: 'Comércio Beta' },
]

const initialWidgets = [
  {
    id: 1,
    name: 'Visão Geral de Vendas',
    url: 'https://lookerstudio.google.com/reporting/12345-abcde',
    clientId: '1',
    order: 1,
  },
  {
    id: 2,
    name: 'Métricas de Marketing',
    url: 'https://lookerstudio.google.com/reporting/67890-fghij',
    clientId: '1',
    order: 2,
  },
  {
    id: 3,
    name: 'Desempenho Anual',
    url: 'https://lookerstudio.google.com/reporting/11111-kkkkk',
    clientId: '2',
    order: 1,
  },
  {
    id: 4,
    name: 'Análise de Estoque',
    url: 'https://lookerstudio.google.com/reporting/22222-lllll',
    clientId: '3',
    order: 1,
  },
]

export default function Widgets() {
  const [widgets, setWidgets] = useState(initialWidgets)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [newWidget, setNewWidget] = useState({ name: '', url: '', clientId: '' })

  const handleCreateWidget = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWidget.clientId) return

    const clientWidgets = widgets.filter((w) => w.clientId === newWidget.clientId)
    const nextOrder =
      clientWidgets.length > 0 ? Math.max(...clientWidgets.map((w) => w.order)) + 1 : 1

    const widget = {
      id: widgets.length + 1,
      name: newWidget.name,
      url: newWidget.url,
      clientId: newWidget.clientId,
      order: nextOrder,
    }

    setWidgets([...widgets, widget])
    setNewWidget({ name: '', url: '', clientId: '' })
    setIsModalOpen(false)
  }

  const handleDelete = (id: number) => {
    setWidgets(widgets.filter((w) => w.id !== id))
  }

  const filteredWidgets =
    clientFilter === 'all' ? widgets : widgets.filter((w) => w.clientId === clientFilter)

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
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white">
                  Salvar
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
            {mockClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
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
              <TableHead className="font-semibold text-slate-900">Nome do Relatório</TableHead>
              <TableHead className="font-semibold text-slate-900">URL do Looker</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWidgets.map((widget) => (
              <TableRow key={widget.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400">
                    <GripVertical className="h-4 w-4 cursor-grab hover:text-slate-600" />
                    <span className="font-medium text-slate-700">{widget.order}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">{widget.name}</TableCell>
                <TableCell className="text-slate-600">
                  <div className="flex items-center gap-2 max-w-[300px] md:max-w-[400px]">
                    <LinkIcon className="h-3.5 w-3.5 shrink-0 text-[#1268b3]" />
                    <a
                      href={widget.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-[#1268b3] hover:underline transition-colors"
                      title={widget.url}
                    >
                      {widget.url}
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
            ))}
            {filteredWidgets.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {clientFilter === 'all'
                    ? 'Nenhum widget cadastrado.'
                    : 'Nenhum widget encontrado para este cliente.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
