import { useState, useMemo, useEffect } from 'react'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getMedicos, type Medico } from '@/services/medicos'
import { getSalas, type Sala } from '@/services/salas'
import { getReservas, getAgendamentos, type Reserva, type Agendamento } from '@/services/agenda'
import DayView from './DayView'
import WeekView from './WeekView'
import MonthView from './MonthView'
import BookingModal from './BookingModal'
import ReservationModal from './ReservationModal'
import { useRealtime } from '@/hooks/use-realtime'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Agenda() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [selectedMedico, setSelectedMedico] = useState<string>('all')
  const [selectedSala, setSelectedSala] = useState<string>('all')
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)

  const isMobile = useIsMobile()
  const activeView = isMobile ? 'day' : view

  const fetchData = async () => {
    const start =
      activeView === 'day'
        ? startOfDay(currentDate)
        : activeView === 'week'
          ? startOfWeek(currentDate)
          : startOfMonth(currentDate)
    const end =
      activeView === 'day'
        ? endOfDay(currentDate)
        : activeView === 'week'
          ? endOfWeek(currentDate)
          : endOfMonth(currentDate)

    const [res, ag, meds, sls] = await Promise.all([
      getReservas(start, end),
      getAgendamentos(start, end),
      getMedicos(),
      getSalas(),
    ])
    setReservas(res)
    setAgendamentos(ag)
    setMedicos(meds)
    setSalas(sls)
  }

  useEffect(() => {
    fetchData()
  }, [currentDate, activeView])
  useRealtime('reservas', fetchData)
  useRealtime('agendamentos', fetchData)

  const navigateDate = (dir: 1 | -1) => {
    if (activeView === 'day') setCurrentDate(addDays(currentDate, dir))
    else if (activeView === 'week') setCurrentDate(addWeeks(currentDate, dir))
    else setCurrentDate(addMonths(currentDate, dir))
  }

  const filteredReservas = useMemo(() => {
    return reservas.filter(
      (r) =>
        (selectedMedico === 'all' || r.medico_id === selectedMedico) &&
        (selectedSala === 'all' || r.sala_id === selectedSala),
    )
  }, [reservas, selectedMedico, selectedSala])

  const headerText =
    activeView === 'day'
      ? format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
      : activeView === 'week'
        ? `${format(startOfWeek(currentDate), 'dd MMM', { locale: ptBR })} - ${format(endOfWeek(currentDate), 'dd MMM, yyyy', { locale: ptBR })}`
        : format(currentDate, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="flex flex-col h-full bg-[#f7e6dc]/30">
      <header className="flex flex-wrap items-center justify-between p-4 bg-background border-b gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold capitalize min-w-[150px]">{headerText}</h2>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {!isMobile && (
            <Tabs value={activeView} onValueChange={(v: any) => setView(v)}>
              <TabsList>
                <TabsTrigger value="day">Dia</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Select value={selectedMedico} onValueChange={setSelectedMedico}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Médico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Médicos</SelectItem>
              {medicos.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSala} onValueChange={setSelectedSala}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Salas</SelectItem>
              {salas.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
            onClick={() => setIsBookingOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Reservar
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeView === 'day' && (
          <DayView
            date={currentDate}
            reservas={filteredReservas}
            agendamentos={agendamentos}
            onSelectReserva={setSelectedReserva}
          />
        )}
        {activeView === 'week' && (
          <WeekView
            date={currentDate}
            reservas={filteredReservas}
            onSelectReserva={setSelectedReserva}
            onDayClick={(d) => {
              setCurrentDate(d)
              setView('day')
            }}
          />
        )}
        {activeView === 'month' && (
          <MonthView
            date={currentDate}
            reservas={filteredReservas}
            onDayClick={(d) => {
              setCurrentDate(d)
              setView('day')
            }}
          />
        )}
      </div>

      <BookingModal
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        medicos={medicos}
        salas={salas}
        onSaved={fetchData}
      />
      {selectedReserva && (
        <ReservationModal
          open={!!selectedReserva}
          onOpenChange={(o) => !o && setSelectedReserva(null)}
          reserva={selectedReserva}
          agendamentos={agendamentos.filter((a) => a.reserva_id === selectedReserva.id)}
        />
      )}
    </div>
  )
}
