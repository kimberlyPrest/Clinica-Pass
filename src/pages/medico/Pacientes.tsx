import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { getPacientes, deletePaciente, type Paciente } from '@/services/pacientes'
import { useRealtime } from '@/hooks/use-realtime'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Plus, Edit, Trash, Search, User, Phone, Mail, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PacienteModal } from './components/PacienteModal'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function Pacientes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [medicoId, setMedicoId] = useState<string>('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)

  useEffect(() => {
    if (user?.tipo_acesso === 'medico') {
      pb.collection('medicos')
        .getFirstListItem(`usuario_id="${user?.id}"`)
        .then((m) => {
          setMedicoId(m.id)
          loadData(m.id)
        })
        .catch(() => setLoading(false))
    } else {
      loadData()
    }
  }, [user])

  const loadData = async (mId?: string) => {
    try {
      const data = await getPacientes(mId)
      setPacientes(data)
    } finally {
      setLoading(false)
    }
  }

  useRealtime('pacientes', () => {
    loadData(user?.tipo_acesso === 'medico' ? medicoId : undefined)
  })

  const filtered = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cpf?.includes(search) ||
      p.telefone?.includes(search),
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este paciente?')) return
    try {
      await deletePaciente(id)
      toast({ title: 'Paciente excluído com sucesso' })
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' })
    }
  }

  const openEdit = (p: Paciente) => {
    setSelectedPaciente(p)
    setModalOpen(true)
  }

  const openNew = () => {
    setSelectedPaciente(null)
    setModalOpen(true)
  }

  return (
    <div className="min-h-full bg-[#f7e6dc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#05807f]">Meus Pacientes</h1>
            <p className="text-muted-foreground">Gerencie os registros e histórico clínico.</p>
          </div>
          <Button
            onClick={openNew}
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white w-full md:w-auto shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Paciente
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50/50"
            />
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhum paciente encontrado.
            </div>
          ) : isMobile ? (
            <div className="grid gap-4">
              {filtered.map((p) => (
                <Card
                  key={p.id}
                  className="bg-white overflow-hidden shadow-sm border border-gray-100"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-lg text-gray-800">{p.nome}</div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                          className="h-8 w-8 text-blue-600 bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(p.id)}
                          className="h-8 w-8 text-red-600 bg-red-50"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" /> {p.telefone}
                      </div>
                      {p.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" /> {p.email}
                        </div>
                      )}
                      {p.cpf && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" /> {p.cpf}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Nascimento</TableHead>
                    {user?.tipo_acesso === 'clinica' && <TableHead>Médico</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {p.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{p.telefone}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.cpf || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.data_nascimento
                          ? format(new Date(p.data_nascimento + 'T00:00:00'), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      {user?.tipo_acesso === 'clinica' && (
                        <TableCell className="text-sm text-muted-foreground">
                          {p.expand?.medico_id?.nome || '-'}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(p)}
                          className="text-[#05807f] hover:text-[#05807f] hover:bg-[#05807f]/10"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <PacienteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        medicoId={medicoId}
        paciente={selectedPaciente}
        onSaved={() => setModalOpen(false)}
      />
    </div>
  )
}
