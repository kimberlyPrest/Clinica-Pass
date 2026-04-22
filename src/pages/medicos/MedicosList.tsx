import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Edit, UserX } from 'lucide-react'
import { getMedicos, type Medico } from '@/services/medicos'
import { useDebounce } from '@/hooks/use-debounce'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { MedicoFormModal } from '@/components/medicos/MedicoFormModal'
import {
  PageWrapper,
  PageHeader,
  DSCard,
  DSCardHeader,
  DSBadge,
  DSAvatar,
  DSSearchInput,
  DSButtonPrimary,
  DSButtonSecondary,
  DSEmptyState,
  DSSkeletonRows,
  DSTableHead,
  DSTableRow,
} from '@/components/ui/design-system'

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
      setMedicos(res.items || [])
      setTotalItems(res.totalItems || 0)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, debouncedSearch])

  useRealtime('medicos', () => loadData())

  const openEditModal = (medico: Medico) => {
    setEditingMedico(medico)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingMedico(null)
    setIsModalOpen(true)
  }

  const getInitials = (nome: string) =>
    nome
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

  return (
    <PageWrapper>
      <PageHeader
        title="Médicos"
        subtitle={`${totalItems} médico${totalItems !== 1 ? 's' : ''} cadastrado${totalItems !== 1 ? 's' : ''}`}
        action={
          isClinica ? (
            <DSButtonPrimary onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              Novo Médico
            </DSButtonPrimary>
          ) : undefined
        }
      />

      <DSCard padded={false}>
        {/* Card header */}
        <DSCardHeader
          title="Todos os Médicos"
          subtitle="Lista de médicos cadastrados na clínica"
          action={
            <div className="max-w-xs w-full">
              <DSSearchInput
                value={search}
                onChange={(v) => {
                  setSearch(v)
                  setPage(1)
                }}
                placeholder="Buscar por nome, email ou especialidade..."
              />
            </div>
          }
        />

        {/* Content */}
        <div className="p-6">
          {error ? (
            <DSEmptyState
              icon={UserX}
              title="Erro ao carregar médicos"
              description="Não foi possível conectar ao servidor. Tente novamente."
              action={<DSButtonSecondary onClick={loadData}>Tentar Novamente</DSButtonSecondary>}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-[#e6e8ea]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f7f9fb] border-b border-[#e6e8ea]">
                    <tr>
                      <DSTableHead>Nome</DSTableHead>
                      <DSTableHead>Especialidade</DSTableHead>
                      <DSTableHead>Tipo</DSTableHead>
                      <DSTableHead>Email</DSTableHead>
                      <DSTableHead>Telefone</DSTableHead>
                      <DSTableHead className="text-right">Ações</DSTableHead>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef0]">
                    {loading ? (
                      <DSSkeletonRows cols={6} rows={5} />
                    ) : !medicos || medicos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-[#6e7979]">
                          <DSEmptyState
                            icon={UserX}
                            title="Nenhum médico encontrado"
                            description={
                              search
                                ? `Nenhum resultado para "${search}".`
                                : 'Nenhum médico cadastrado ainda.'
                            }
                            action={
                              isClinica ? (
                                <DSButtonPrimary onClick={openCreateModal}>
                                  <Plus className="w-4 h-4" />
                                  Adicionar Médico
                                </DSButtonPrimary>
                              ) : undefined
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      medicos.map((m, i) => (
                        <DSTableRow key={m.id} delay={i * 40}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <DSAvatar initials={getInitials(m.nome)} />
                              <Link
                                to={`/medicos/${m.id}`}
                                className="font-semibold text-[#191c1e] hover:text-[#05807f] transition-colors"
                              >
                                {m.nome}
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#3e4948]">
                            {m.especialidade || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <DSBadge variant={m.tipo === 'mensalista' ? 'teal' : 'peach'}>
                              {m.tipo === 'mensalista' ? 'Mensalista' : 'Avulso'}
                            </DSBadge>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#3e4948]">{m.email || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[#3e4948]">{m.telefone || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                to={`/medicos/${m.id}`}
                                className="p-1.5 rounded-lg hover:bg-[#f0dfd5] text-[#6e7979] hover:text-[#05807f] transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              {isClinica && (
                                <button
                                  onClick={() => openEditModal(m)}
                                  className="p-1.5 rounded-lg hover:bg-[#f0dfd5] text-[#6e7979] hover:text-[#05807f] transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </DSTableRow>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl border border-[#e6e8ea] p-4 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))
                  : medicos?.map((m, i) => (
                      <div
                        key={m.id}
                        className="bg-white rounded-xl border border-[#e6e8ea] p-4 space-y-3 animate-fade-in"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <DSAvatar
                              initials={getInitials(m.nome)}
                              className="w-10 h-10 text-sm shrink-0"
                            />
                            <div className="min-w-0">
                              <Link
                                to={`/medicos/${m.id}`}
                                className="font-semibold text-[#191c1e] hover:text-[#05807f] transition-colors truncate block"
                              >
                                {m.nome}
                              </Link>
                              <p className="text-xs text-[#6e7979] truncate">
                                {m.especialidade || '—'}
                              </p>
                            </div>
                          </div>
                          <DSBadge variant={m.tipo === 'mensalista' ? 'teal' : 'peach'}>
                            {m.tipo === 'mensalista' ? 'Mensalista' : 'Avulso'}
                          </DSBadge>
                        </div>
                        <div className="text-xs text-[#3e4948] space-y-1 pl-13">
                          {m.email && <p>{m.email}</p>}
                          {m.telefone && <p>{m.telefone}</p>}
                        </div>
                        {isClinica && (
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => openEditModal(m)}
                              className="flex items-center gap-1.5 text-xs font-medium text-[#05807f] bg-[#f0dfd5] hover:bg-[#d3c3ba] px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Editar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
              </div>

              {/* Pagination */}
              {totalItems > 10 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#e6e8ea]">
                  <p className="text-sm text-[#6e7979]">
                    {(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)} de {totalItems} médicos
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-[#e6e8ea] bg-white hover:bg-[#f0dfd5] text-[#3e4948] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      disabled={page * 10 >= totalItems}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-[#e6e8ea] bg-white hover:bg-[#f0dfd5] text-[#3e4948] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DSCard>

      <MedicoFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        medico={editingMedico}
        onSuccess={loadData}
      />
    </PageWrapper>
  )
}
