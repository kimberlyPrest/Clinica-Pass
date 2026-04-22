import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import type { Reserva } from '@/services/agenda'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ReservaCard } from './components/ReservaCard'
import { MedicoBookingModal } from './components/MedicoBookingModal'
import { MedicoAgendamentoModal } from './components/MedicoAgendamentoModal'
import { CalendarDays } from 'lucide-react'

export default function Reservas() {
  const { user } = useAuth()
  const [medico, setMedico] = useState<any>(null)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [period, setPeriod] = useState<'dia' | 'semana' | 'mes'>('semana')
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAgendamentoOpen, setIsAgendamentoOpen] = useState(false)
  const [selectedReservaId, setSelectedReservaId] = useState<string>('')

  const loadData = async () => {
    if (!user) return
    try {
      const med = await pb.collection('medicos').getFirstListItem(`usuario_id = "${user.id}"`)
      setMedico(med)

      let start = startOfWeek(new Date())
      let end = endOfWeek(new Date())
      if (period === 'dia') {
        start = startOfDay(new Date())
        end = endOfDay(new Date())
      } else if (period === 'mes') {
        start = startOfMonth(new Date())
        end = endOfMonth(new Date())
      }

      const res = await pb.collection('reservas').getFullList<Reserva>({
        filter: `medico_id = "${med.id}" && data_inicio >= "${start.toISOString()}" && data_inicio <= "${end.toISOString()}"`,
        expand: 'sala_id',
        sort: 'data_inicio',
      })
      setReservas(res)
    } catch (e) {
      console.error('Erro ao carregar dados do médico ou reservas:', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user, period])
  useRealtime('reservas', () => loadData())

  const proximas = reservas.filter((r) => new Date(r.data_inicio) >= new Date())
  const historico = reservas.filter((r) => new Date(r.data_inicio) < new Date())

  const handleAgendar = (reservaId: string) => {
    setSelectedReservaId(reservaId)
    setIsAgendamentoOpen(true)
  }

  if (!medico) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <CalendarDays className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-semibold">Perfil de Médico não encontrado</h2>
        <p className="text-muted-foreground mt-2">
          Apenas usuários com perfil de médico podem acessar esta página.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Minhas Reservas</h1>
          <p className="text-muted-foreground">Gerencie seus horários de atendimento e salas.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsBookingOpen(true)}
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
          >
            + Reserva
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#05807f] flex items-center gap-2">
            <div className="w-2 h-6 bg-[#05807f] rounded-full"></div>
            Próximas Reservas
          </h2>
          {proximas.length === 0 ? (
            <div className="bg-muted/30 border border-dashed rounded-lg p-8 text-center text-muted-foreground">
              Nenhuma reserva futura neste período.
            </div>
          ) : (
            <div className="grid gap-4">
              {proximas.map((r) => (
                <ReservaCard
                  key={r.id}
                  reserva={r}
                  onAgendar={() => handleAgendar(r.id)}
                  onRefresh={loadData}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-6 bg-muted rounded-full"></div>
            Histórico de Reservas
          </h2>
          {historico.length === 0 ? (
            <div className="bg-muted/30 border border-dashed rounded-lg p-8 text-center text-muted-foreground">
              Nenhum histórico neste período.
            </div>
          ) : (
            <div className="grid gap-4 opacity-75">
              {historico.map((r) => (
                <ReservaCard
                  key={r.id}
                  reserva={r}
                  onAgendar={() => handleAgendar(r.id)}
                  onRefresh={loadData}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <MedicoBookingModal
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        medicoId={medico.id}
        onSaved={loadData}
        onOpenAgendamento={(resId) => {
          setIsBookingOpen(false)
          setSelectedReservaId(resId)
          setIsAgendamentoOpen(true)
        }}
      />
      <MedicoAgendamentoModal
        open={isAgendamentoOpen}
        onOpenChange={setIsAgendamentoOpen}
        medicoId={medico.id}
        preSelectedReservaId={selectedReservaId}
        onSaved={loadData}
        onOpenNovaReserva={() => {
          setIsAgendamentoOpen(false)
          setIsBookingOpen(true)
        }}
      />
    </div>
  )
}
