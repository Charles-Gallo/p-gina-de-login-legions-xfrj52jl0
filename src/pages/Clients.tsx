import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
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

const initialClients = [
  { id: 1, name: 'Empresa Alpha', email: 'contato@alpha.com', status: 'Ativo' },
  { id: 2, name: 'Tech Solutions', email: 'hello@techsolutions.com', status: 'Ativo' },
  { id: 3, name: 'Comércio Beta', email: 'admin@beta.com.br', status: 'Inativo' },
]

export default function Clients() {
  const [clients, setClients] = useState(initialClients)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', settings: '' })

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    const client = {
      id: clients.length + 1,
      name: newClient.name,
      email: newClient.email,
      status: 'Ativo',
    }
    setClients([...clients, client])
    setNewClient({ name: '', email: '', settings: '' })
    setIsModalOpen(false)
  }

  const handleDelete = (id: number) => {
    setClients(clients.filter((c) => c.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gerencie os clientes cadastrados no sistema.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="contato@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings">Configurações</Label>
                <Input
                  id="settings"
                  value={newClient.settings}
                  onChange={(e) => setNewClient({ ...newClient, settings: e.target.value })}
                  placeholder="Configurações em JSON ou texto"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white">
                  Salvar Cliente
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-semibold text-slate-900">Nome</TableHead>
              <TableHead className="font-semibold text-slate-900">Email</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-900">{client.name}</TableCell>
                <TableCell className="text-slate-600">{client.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      client.status === 'Ativo'
                        ? 'bg-[#1268b3]/10 text-[#1268b3] border-[#1268b3]/20 hover:bg-[#1268b3]/20'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }
                  >
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-slate-600 hover:text-[#1268b3] hover:bg-[#1268b3]/10"
                    >
                      <Edit2 className="mr-2 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                      className="h-8 text-[#ed1b32] hover:text-[#ed1b32] hover:bg-[#ed1b32]/10"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Deletar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
