import { useState, useEffect, useMemo } from 'react'
import { startOfMonth, endOfMonth, differenceInMinutes, parseISO, format } from 'date-fns'
import {
  getSalas,
  getTodasReservasdoMes,
  getProximaReservaDaSala,
  type Sala,
} from '@/services/salas'
import { getBloqueios, type Bloqueio } from '@/services/bloqueios'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Plus, DoorOpen } from 'lucide-react'
import { SalaCard } from './components/SalaCard'
import { SalaFormModal } from './components/SalaFormModal'
import { BloqueioFormModal } from './components/BloqueioFormModal'
import { AgendaSala } from './components/AgendaSala'
import {
  PageWrapper,
  PageHeader,
  DSCard,
  DSCardHeader,
  DSSearchInput,
  DSButtonPrimary,
  DSEmptyState,
} from '@/components/ui/design-system'

interface SalaStats {
  ocupacao: number
  proximoUso: string
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

function calcularOcupacao(salaId: string, sala: Sala, reservas: any[]): number {
  const reservasDaSala = reservas.filter((r: any) => r.sala_id === salaId)
  if (reservasDaSala.length === 0) return 0

  const totalReservedMinutes = reservasDaSala.reduce((acc: number, r: any) => {
    return acc + differenceInMinutes(parseISO(r.data_fim), parseISO(r.data_inicio))
  }, 0)

  const workMinutesPerDay = Math.max(
    0,
    timeToMinutes(sala.horario_fim || '19:00') - timeToMinutes(sala.horario_inicio || '09:00'),
  )
  const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const totalAvailable = workMinutesPerDay * diasNoMes

  return totalAvailable > 0
    ? Math.min(100, Math.round((totalReservedMinutes / totalAvailable) * 100))
    : 0
}

function formatProximoUso(reserva: any): string {
  if (!reserva) return 'Sem reservas'
  const inicio = parseISO(reserva.data_inicio)
  const hoje = new Date()
  const isHoje =
    inicio.getFullYear() === hoje.getFullYear() &&
    inicio.getMonth() === hoje.getMonth() &&
    inicio.getDate() === hoje.getDate()
  return isHoje ? format(inicio, 'HH:mm') : format(inicio, 'dd/MM')
}

export default function SalasList() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])
  const [statsMap, setStatsMap] = useState<Map<string, SalaStats>>(new Map())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('todas')
  const [ocupacaoMin, setOcupacaoMin] = useState([0])

  const [modalSala, setModalSala] = useState<{ open: boolean; sala?: Sala }>({ open: false })
  const [modalBloqueio, setModalBloqueio] = useState<{ open: boolean; salaId?: string }>({
    open: false,
  })
  const [agendaSala, setAgendaSala] = useState<{ open: boolean; sala?: Sala }>({ open: false })

  const loadData = async () => {
    try {
      const now = new Date()
      const [s, b, todasReservas] = await Promise.all([
        getSalas(),
        getBloqueios(),
        getTodasReservasdoMes(startOfMonth(now), endOfMonth(now)),
      ])
      setSalas(s)
      setBloqueios(b)
      const proximasReservas = await Promise.all(s.map((sala) => getProximaReservaDaSala(sala.id)))
      const newMap = new Map<string, SalaStats>()
      s.forEach((sala, i) => {
        newMap.set(sala.id, {
          ocupacao: calcularOcupacao(sala.id, sala, todasReservas),
          proximoUso: formatProximoUso(proximasReservas[i]),
        })
      })
      setStatsMap(newMap)
    } catch (e) {
      console.error('Failed to load data', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('salas', () => loadData())
  useRealtime('bloqueios', () => loadData())
  useRealtime('reservas', () => loadData())

  const filteredSalas = useMemo(() => {
    return salas.filter((s) => {
      const matchSearch = s.nome.toLowerCase().includes(search.toLowerCase())
      const matchStatus = status === 'todas' || s.status === status
      const ocupacao = statsMap.get(s.id)?.ocupacao ?? 0
      const matchOcupacao = ocupacao >= ocupacaoMin[0]
      return matchSearch && matchStatus && matchOcupacao
    })
  }, [salas, search, status, ocupacaoMin, statsMap])

  return (
    <PageWrapper>
      <PageHeader
        title="Gestão de Salas"
        subtitle="Gerencie disponibilidade, horários e bloqueios"
        action={
          <DSButtonPrimary onClick={() => setModalSala({ open: true })}>
            <Plus className="w-4 h-4" />
            Nova Sala
          </DSButtonPrimary>
        }
      />

      {/* Filters Card */}
      <DSCard>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="text-xs font-semibold text-[#6e7979] uppercase tracking-widest mb-2 block">
              Buscar
            </label>
            <DSSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar sala por nome..."
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-[#6e7979] uppercase tracking-widest mb-2 block">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-[#e6e8ea] bg-white text-[#191c1e] focus:ring-[#05807f]/30 focus:border-[#05807f]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos Status</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="inativa">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-5">
            <label className="text-xs font-semibold text-[#6e7979] uppercase tracking-widest mb-2 block">
              Ocupação Mínima: <span className="text-[#05807f] font-bold">{ocupacaoMin[0]}%</span>
            </label>
            <Slider
              value={ocupacaoMin}
              onValueChange={setOcupacaoMin}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-[#05807f] [&_[role=slider]]:border-[#05807f] [&_.relative>span:first-child]:bg-[#05807f]"
            />
          </div>
        </div>
      </DSCard>

      {/* Salas Grid */}
      {filteredSalas.length === 0 ? (
        <DSCard>
          <DSEmptyState
            icon={DoorOpen}
            title="Nenhuma sala encontrada"
            description={
              search || status !== 'todas' || ocupacaoMin[0] > 0
                ? 'Nenhuma sala corresponde aos filtros aplicados.'
                : 'Nenhuma sala cadastrada ainda.'
            }
            action={
              <DSButtonPrimary onClick={() => setModalSala({ open: true })}>
                <Plus className="w-4 h-4" />
                Adicionar Sala
              </DSButtonPrimary>
            }
          />
        </DSCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSalas.map((sala) => (
            <SalaCard
              key={sala.id}
              sala={sala}
              ocupacao={statsMap.get(sala.id)?.ocupacao ?? 0}
              proximoUso={statsMap.get(sala.id)?.proximoUso ?? '...'}
              onEdit={() => setModalSala({ open: true, sala })}
              onBlock={() => setModalBloqueio({ open: true, salaId: sala.id })}
              onOpenAgenda={() => setAgendaSala({ open: true, sala })}
            />
          ))}
        </div>
      )}

      {modalSala.open && (
        <SalaFormModal
          open={modalSala.open}
          sala={modalSala.sala}
          bloqueios={bloqueios.filter((b) => b.sala_id === modalSala.sala?.id)}
          onOpenChange={(op) => setModalSala({ open: op })}
          onAddBlock={(salaId) => setModalBloqueio({ open: true, salaId })}
        />
      )}

      {modalBloqueio.open && modalBloqueio.salaId && (
        <BloqueioFormModal
          open={modalBloqueio.open}
          salaId={modalBloqueio.salaId}
          onOpenChange={(op) => setModalBloqueio({ open: op })}
        />
      )}

      {agendaSala.open && agendaSala.sala && (
        <AgendaSala
          open={agendaSala.open}
          sala={agendaSala.sala}
          onOpenChange={(op) => setAgendaSala({ open: op })}
        />
      )}
    </PageWrapper>
  )
}
