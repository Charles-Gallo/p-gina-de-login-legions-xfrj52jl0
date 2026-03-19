import { useState } from 'react'
import { Plus, ShieldAlert, ShieldCheck } from 'lucide-react'
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

const mockClients = [
  { id: '1', name: 'Empresa Alpha' },
  { id: '2', name: 'Tech Solutions' },
  { id: '3', name: 'Comércio Beta' },
]

const initialUsers = [
  { id: 1, name: 'Ana Costa', email: 'ana@alpha.com', clientId: '1', status: 'Ativo' },
  {
    id: 2,
    name: 'Carlos Santos',
    email: 'carlos@techsolutions.com',
    clientId: '2',
    status: 'Ativo',
  },
  { id: 3, name: 'Maria Oliveira', email: 'maria@beta.com.br', clientId: '3', status: 'Inativo' },
  { id: 4, name: 'João Silva', email: 'joao@alpha.com', clientId: '1', status: 'Ativo' },
  {
    id: 5,
    name: 'Pedro Alves',
    email: 'pedro@techsolutions.com',
    clientId: '2',
    status: 'Inativo',
  },
]

export default function Users() {
  const [users, setUsers] = useState(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [newUser, setNewUser] = useState({ name: '', email: '', clientId: '' })

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.clientId) return

    const user = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      clientId: newUser.clientId,
      status: 'Ativo',
    }
    setUsers([...users, user])
    setNewUser({ name: '', email: '', clientId: '' })
    setIsModalOpen(false)
  }

  const toggleStatus = (id: number) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u,
      ),
    )
  }

  const filteredUsers =
    clientFilter === 'all' ? users : users.filter((u) => u.clientId === clientFilter)

  const getClientName = (clientId: string) => {
    return mockClients.find((c) => c.id === clientId)?.name || 'Desconhecido'
  }

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
              <TableHead className="font-semibold text-slate-900">Nome</TableHead>
              <TableHead className="font-semibold text-slate-900">Email</TableHead>
              <TableHead className="font-semibold text-slate-900">Cliente</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                <TableCell className="text-slate-600">{user.email}</TableCell>
                <TableCell className="text-slate-600">{getClientName(user.clientId)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.status === 'Ativo'
                        ? 'bg-[#1268b3]/10 text-[#1268b3] border-[#1268b3]/20'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(user.id)}
                    className={
                      user.status === 'Ativo'
                        ? 'text-[#ed1b32] hover:text-[#ed1b32] hover:bg-[#ed1b32]/10 h-8'
                        : 'text-[#1268b3] hover:text-[#1268b3] hover:bg-[#1268b3]/10 h-8'
                    }
                  >
                    {user.status === 'Ativo' ? (
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
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum usuário encontrado para este filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
