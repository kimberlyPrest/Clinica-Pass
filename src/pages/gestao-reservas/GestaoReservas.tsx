import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getReservas } from '@/services/reservas'
import { getAgendamentos } from '@/services/agendamentos'
import { getMedicos } from '@/services/medicos'
import { getSalas } from '@/services/salas'
import { useRealtime } from '@/hooks/use-realtime'
import { ReservaFiltros } from './components/ReservaFiltros'
import { ReservaList } from './components/ReservaList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { isSameDay, isThisWeek, isThisMonth } from 'date-fns'

export default function GestaoReservas() {
  const { user } = useAuth()

  if (user?.tipo_acesso === 'medico') {
    return <Navigate to="/medico/dashboard" replace />
  }

  const [reservas, setReservas] = useState<any[]>([])
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [medicos, setMedicos] = useState<any[]>([])
  const [salas, setSalas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('mes')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [medicoFilter, setMedicoFilter] = useState<string[]>([])
  const [salaFilter, setSalaFilter] = useState<string[]>([])

  const loadData = async () => {
    try {
      setError(false)
      const [resData, agData, medData, salData] = await Promise.all([
        getReservas(),
        getAgendamentos(),
        getMedicos(),
        getSalas(),
      ])
      setReservas(resData)
      setAgendamentos(agData)
      setMedicos(medData)
      setSalas(salData)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('reservas', loadData)
  useRealtime('agendamentos', loadData)

  const filteredReservas = reservas.filter((r) => {
    if (statusFilter !== 'todas' && r.status !== statusFilter) return false
    if (medicoFilter.length > 0 && !medicoFilter.includes(r.medico_id)) return false
    if (salaFilter.length > 0 && !salaFilter.includes(r.sala_id)) return false

    const rDate = new Date(r.data_inicio)
    const today = new Date()
    if (dateFilter === 'hoje' && !isSameDay(rDate, today)) return false
    if (dateFilter === 'semana' && !isThisWeek(rDate)) return false
    if (dateFilter === 'mes' && !isThisMonth(rDate)) return false

    if (search) {
      const s = search.toLowerCase()
      const docName = r.expand?.medico_id?.nome?.toLowerCase() || ''
      const hasPatient = agendamentos.some(
        (a) => a.reserva_id === r.id && a.paciente_nome.toLowerCase().includes(s),
      )
      if (!docName.includes(s) && !hasPatient) return false
    }

    return true
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up bg-[#f7e6dc] min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-[#05807f]">
            Reservas
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as reservas da clínica.</p>
        </div>
        <Button className="w-full md:w-auto bg-[#05807f] hover:bg-[#046666]">
          <Plus className="w-4 h-4 mr-2" /> Nova Reserva
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
        <ReservaFiltros
          search={search}
          setSearch={setSearch}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          medicoFilter={medicoFilter}
          setMedicoFilter={setMedicoFilter}
          salaFilter={salaFilter}
          setSalaFilter={setSalaFilter}
          medicos={medicos}
          salas={salas}
        />

        <ReservaList
          loading={loading}
          error={error}
          onRetry={loadData}
          reservas={filteredReservas}
          agendamentos={agendamentos}
          salas={salas}
        />
      </div>
    </div>
  )
}
