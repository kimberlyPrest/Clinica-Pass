import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, UserX, Edit } from 'lucide-react'
import { getMedicos, type Medico } from '@/services/medicos'
import { useDebounce } from '@/hooks/use-debounce'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MedicoFormModal } from '@/components/medicos/MedicoFormModal'

export default function MedicosList() {
  const { user } = useAuth()
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null)

  const isClinica = user?.tipo_acesso === 'clinica'

  const loadData = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getMedicos(page, debouncedSearch)
      setMedicos(res.items)
      setTotalItems(res.totalItems)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, debouncedSearch])

  useRealtime('medicos', () => {
    loadData()
  })

  const openEditModal = (medico: Medico) => {
    setEditingMedico(medico)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingMedico(null)
    setIsModalOpen(true)
  }

  return (
    <div className="p-4 md:p-8 bg-[#f7e6dc] min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-[#05807f]">Médicos</h1>
          {isClinica && (
            <Button
              onClick={openCreateModal}
              className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Médico
            </Button>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou especialidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Erro ao carregar médicos.</p>
              <Button onClick={loadData} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : medicos.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UserX className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <p className="mb-4">Nenhum médico cadastrado ou encontrado.</p>
              {isClinica && (
                <Button onClick={openCreateModal} variant="outline">
                  Adicionar Médico
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nome</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicos.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          <Link to={`/medicos/${m.id}`} className="hover:underline text-[#05807f]">
                            {m.nome}
                          </Link>
                        </TableCell>
                        <TableCell>{m.especialidade || '-'}</TableCell>
                        <TableCell>
                          {m.tipo === 'mensalista' ? (
                            <Badge
                              style={{ backgroundColor: '#05807f' }}
                              className="text-white hover:bg-[#05807f]/90"
                            >
                              Mensalista
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Avulso</Badge>
                          )}
                        </TableCell>
                        <TableCell>{m.email || '-'}</TableCell>
                        <TableCell>{m.telefone || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/medicos/${m.id}`}>
                                <Search className="h-4 w-4" />
                              </Link>
                            </Button>
                            {isClinica && (
                              <Button variant="ghost" size="icon" onClick={() => openEditModal(m)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {medicos.map((m) => (
                  <div key={m.id} className="border p-4 rounded-lg space-y-3 relative">
                    <div className="flex justify-between items-start pr-8">
                      <div>
                        <Link
                          to={`/medicos/${m.id}`}
                          className="font-semibold text-lg hover:underline text-[#05807f]"
                        >
                          {m.nome}
                        </Link>
                        <p className="text-sm text-muted-foreground">{m.especialidade}</p>
                      </div>
                      {m.tipo === 'mensalista' ? (
                        <Badge
                          style={{ backgroundColor: '#05807f' }}
                          className="text-white hover:bg-[#05807f]/90"
                        >
                          Mensalista
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Avulso</Badge>
                      )}
                    </div>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">Email:</span> {m.email || '-'}
                      </p>
                      <p>
                        <span className="font-medium">Tel:</span> {m.telefone || '-'}
                      </p>
                    </div>
                    {isClinica && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => openEditModal(m)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalItems > 10 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} de{' '}
                    {totalItems}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page * 10 >= totalItems}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MedicoFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        medico={editingMedico}
        onSuccess={loadData}
      />
    </div>
  )
}
