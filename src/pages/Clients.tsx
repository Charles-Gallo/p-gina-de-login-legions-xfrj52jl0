import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'
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

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', status: 'Ativo' })
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

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const { error } = await supabase.from('clientes').insert({
      nome: newClient.name,
      email_contato: newClient.email,
      ativo: newClient.status === 'Ativo',
    })
    setIsSaving(false)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar cliente' })
      return
    }
    toast({ title: 'Cliente criado com sucesso' })
    setIsModalOpen(false)
    setNewClient({ name: '', email: '', status: 'Ativo' })
    fetchClients()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao remover cliente' })
      return
    }
    toast({ title: 'Cliente removido' })
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
                <Label htmlFor="email">E-mail</Label>
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newClient.status}
                  onValueChange={(val) => setNewClient({ ...newClient, status: val })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  disabled={isSaving}
                  type="submit"
                  className="bg-[#1268b3] hover:bg-[#1268b3]/90 text-white"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Cliente'}
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
              <TableHead className="font-semibold text-slate-900">E-mail</TableHead>
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
                          ? 'bg-[#1268b3]/10 text-[#1268b3] border-[#1268b3]/20 hover:bg-[#1268b3]/20'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }
                    >
                      {client.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(client.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(client)}
                        className={
                          client.ativo
                            ? 'text-[#ed1b32] hover:text-[#ed1b32] hover:bg-[#ed1b32]/10 h-8'
                            : 'text-[#1268b3] hover:text-[#1268b3] hover:bg-[#1268b3]/10 h-8'
                        }
                      >
                        {client.ativo ? (
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
                        onClick={() => handleDelete(client.id)}
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
