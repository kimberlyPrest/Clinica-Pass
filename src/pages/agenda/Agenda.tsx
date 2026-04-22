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
import { ChevronLeft, ChevronRight, Plus, List, CalendarDays, CalendarRange } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getMedicos, getAllMedicos, type Medico } from '@/services/medicos'
import { getSalas, type Sala } from '@/services/salas'
import { getReservas, getAgendamentos, type Reserva, type Agendamento } from '@/services/agenda'
import DayView from './DayView'
import WeekView from './WeekView'
import MonthView from './MonthView'
import BookingModal from './BookingModal'
import ReservationModal from './ReservationModal'
import AgendaListView from './AgendaListView'
import { useRealtime } from '@/hooks/use-realtime'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Agenda() {
  const [view, setView] = useState<'day' | 'week' | 'month' | 'custom'>('day')
  const [displayMode, setDisplayMode] = useState<'calendar' | 'list'>('calendar')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [customStart, setCustomStart] = useState<Date | undefined>(new Date())
  const [customEnd, setCustomEnd] = useState<Date | undefined>(new Date())
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [selectedMedico, setSelectedMedico] = useState<string>('all')
  const [selectedSala, setSelectedSala] = useState<string>('all')
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  const [bookingInitialDate, setBookingInitialDate] = useState<string | undefined>()
  const [bookingInitialTime, setBookingInitialTime] = useState<string | undefined>()

  const isMobile = useIsMobile()
  const activeView = isMobile ? 'day' : view

  const fetchData = async () => {
    let start: Date
    let end: Date
    if (activeView === 'custom') {
      start = startOfDay(customStart ?? new Date())
      end = endOfDay(customEnd ?? new Date())
    } else if (activeView === 'day') {
      start = startOfDay(currentDate)
      end = endOfDay(currentDate)
    } else if (activeView === 'week') {
      start = startOfWeek(currentDate)
      end = endOfWeek(currentDate)
    } else {
      start = startOfMonth(currentDate)
      end = endOfMonth(currentDate)
    }

    const [res, ag, meds, sls] = await Promise.all([
      getReservas(start, end),
      getAgendamentos(start, end),
      getAllMedicos(),
      getSalas(),
    ])
    setReservas(res)
    setAgendamentos(ag)
    setMedicos(meds)
    setSalas(sls)
  }

  useEffect(() => {
    fetchData()
  }, [currentDate, activeView, customStart, customEnd])
  useRealtime('reservas', fetchData)
  useRealtime('agendamentos', fetchData)

  const navigateDate = (dir: 1 | -1) => {
    if (activeView === 'day') setCurrentDate(addDays(currentDate, dir))
    else if (activeView === 'week') setCurrentDate(addWeeks(currentDate, dir))
    else if (activeView === 'month') setCurrentDate(addMonths(currentDate, dir))
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
        : activeView === 'month'
          ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
          : customStart && customEnd
            ? `${format(customStart, 'dd/MM/yyyy')} – ${format(customEnd, 'dd/MM/yyyy')}`
            : 'Período personalizado'

  const handleSlotClick = (date: Date, hour: number) => {
    setBookingInitialDate(format(date, 'yyyy-MM-dd'))
    setBookingInitialTime(`${hour.toString().padStart(2, '0')}:00`)
    setIsBookingOpen(true)
  }

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex flex-wrap items-center justify-between px-6 py-3 bg-white border-b border-[#e6e8ea] gap-3 shadow-[0_1px_3px_rgba(5,128,127,0.06)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-[#e6e8ea] bg-white hover:bg-[#f0dfd5] text-[#05807f] transition-colors duration-200"
          >
            Hoje
          </button>
          <div className="flex items-center">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-lg hover:bg-[#f0dfd5] text-[#3e4948] hover:text-[#05807f] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-lg hover:bg-[#f0dfd5] text-[#3e4948] hover:text-[#05807f] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-sm font-semibold capitalize text-[#191c1e] min-w-[150px]">
            {headerText}
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Tabs value={displayMode} onValueChange={(v: any) => setDisplayMode(v)}>
            <TabsList className="bg-[#f2f4f6] p-0.5 rounded-lg h-auto">
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[#6e7979] data-[state=active]:bg-white data-[state=active]:text-[#05807f] data-[state=active]:shadow-sm transition-all"
              >
                <CalendarDays className="w-3.5 h-3.5" /> Calendário
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[#6e7979] data-[state=active]:bg-white data-[state=active]:text-[#05807f] data-[state=active]:shadow-sm transition-all"
              >
                <List className="w-3.5 h-3.5" /> Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {!isMobile && displayMode === 'calendar' && (
            <Tabs value={activeView} onValueChange={(v: any) => setView(v)}>
              <TabsList className="bg-[#f2f4f6] p-0.5 rounded-lg h-auto">
                {(['day', 'week', 'month'] as const).map((v) => (
                  <TabsTrigger
                    key={v}
                    value={v}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-[#6e7979] data-[state=active]:bg-white data-[state=active]:text-[#05807f] data-[state=active]:shadow-sm transition-all"
                  >
                    {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                  </TabsTrigger>
                ))}
                <TabsTrigger
                  value="custom"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[#6e7979] data-[state=active]:bg-white data-[state=active]:text-[#05807f] data-[state=active]:shadow-sm transition-all"
                >
                  <CalendarRange className="w-3.5 h-3.5" /> Período
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Custom range date pickers */}
          {activeView === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#e6e8ea] bg-white hover:border-[#05807f] hover:text-[#05807f] text-[#3e4948] transition-colors">
                    {customStart ? format(customStart, 'dd/MM/yyyy') : 'Início'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStart}
                    onSelect={(d) => d && setCustomStart(d)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-[#6e7979] text-xs">até</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#e6e8ea] bg-white hover:border-[#05807f] hover:text-[#05807f] text-[#3e4948] transition-colors">
                    {customEnd ? format(customEnd, 'dd/MM/yyyy') : 'Fim'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEnd}
                    onSelect={(d) => d && setCustomEnd(d)}
                    locale={ptBR}
                    disabled={(d) => (customStart ? d < customStart : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Select value={selectedMedico} onValueChange={setSelectedMedico}>
            <SelectTrigger className="w-[160px] text-sm border-[#e6e8ea] bg-white focus:ring-[#05807f]/30 focus:border-[#05807f]">
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
            <SelectTrigger className="w-[140px] text-sm border-[#e6e8ea] bg-white focus:ring-[#05807f]/30 focus:border-[#05807f]">
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

          <button
            className="flex items-center gap-2 bg-[#05807f] hover:bg-[#006564] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={() => {
              setBookingInitialDate(undefined)
              setBookingInitialTime(undefined)
              setIsBookingOpen(true)
            }}
          >
            <Plus className="w-4 h-4" /> Reservar
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {displayMode === 'list' ? (
          <AgendaListView
            reservas={filteredReservas}
            agendamentos={agendamentos}
            onSelectReserva={setSelectedReserva}
          />
        ) : (
          <>
            {activeView === 'day' && (
              <DayView
                date={currentDate}
                reservas={filteredReservas}
                agendamentos={agendamentos}
                onSelectReserva={setSelectedReserva}
                onSlotClick={handleSlotClick}
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
          </>
        )}
      </div>

      <BookingModal
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        medicos={medicos}
        salas={salas}
        onSaved={fetchData}
        initialDate={bookingInitialDate}
        initialTime={bookingInitialTime}
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
