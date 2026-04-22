import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MedicoBookingModal } from './components/MedicoBookingModal'
import { MedicoAgendamentoModal } from './components/MedicoAgendamentoModal'
import { getReservasMedicoPeriodo, getConsultasMedicoPeriodo } from '@/services/agenda'
import { MedicoDayView } from './components/MedicoDayView'
import { MedicoWeekView } from './components/MedicoWeekView'
import { MedicoMonthView } from './components/MedicoMonthView'
import { MedicoListView } from './components/MedicoListView'
import { ReservaDetailsModal } from './components/ReservaDetailsModal'
import { AgendamentoDetailsModal } from './components/AgendamentoDetailsModal'
import { useRealtime } from '@/hooks/use-realtime'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Calendar as CalendarIcon,
  List,
  CalendarRange,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function Calendario() {
  const { user } = useAuth()
  const [medico, setMedico] = useState<any>(null)

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [calendarType, setCalendarType] = useState<'day' | 'week' | 'month' | 'custom'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [search, setSearch] = useState('')
  const [customStart, setCustomStart] = useState<Date | undefined>(new Date())
  const [customEnd, setCustomEnd] = useState<Date | undefined>(new Date())

  const [reservas, setReservas] = useState<any[]>([])
  const [agendamentos, setAgendamentos] = useState<any[]>([])

  const [bookingOpen, setBookingOpen] = useState(false)
  const [agendamentoOpen, setAgendamentoOpen] = useState(false)
  const [preSelectedReservaId, setPreSelectedReservaId] = useState<string | undefined>()

  const [reservaDetailsOpen, setReservaDetailsOpen] = useState(false)
  const [agendamentoDetailsOpen, setAgendamentoDetailsOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState<any>(null)
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null)
  const { toast } = useToast()

  const handleStatusChange = async (id: string, status: string, hora_inicio: string) => {
    if (startOfDay(parseISO(hora_inicio)) < startOfDay(new Date())) {
      toast({
        title: 'Acesso negado',
        description: 'Este agendamento já passou',
        variant: 'destructive',
      })
      return
    }
    try {
      await pb.collection('agendamentos').update(id, { status })
      toast({ title: 'Status atualizado' })
      loadData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    if (user?.id) {
      pb.collection('medicos')
        .getFirstListItem(`usuario_id="${user.id}"`)
        .then(setMedico)
        .catch(console.error)
    }
  }, [user])

  const loadData = async () => {
    if (!medico) return
    let start: Date, end: Date
    if (calendarType === 'custom') {
      start = startOfDay(customStart ?? new Date())
      end = endOfDay(addDays(customEnd ?? new Date(), 1))
    } else if (viewMode === 'list' || calendarType === 'month') {
      start = startOfMonth(currentDate)
      end = endOfMonth(currentDate)
    } else if (calendarType === 'week') {
      start = startOfWeek(currentDate)
      end = endOfWeek(currentDate)
    } else {
      start = startOfDay(currentDate)
      end = addDays(startOfDay(currentDate), 1)
    }

    try {
      const res = await getReservasMedicoPeriodo(medico.id, start, end)
      const ags = await getConsultasMedicoPeriodo(medico.id, start, end)
      setReservas(res)
      setAgendamentos(ags)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [medico, currentDate, viewMode, calendarType, customStart, customEnd])

  useRealtime('reservas', loadData)
  useRealtime('agendamentos', loadData)

  const handlePrev = () => {
    if (calendarType === 'month' || viewMode === 'list') setCurrentDate(subMonths(currentDate, 1))
    else if (calendarType === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else if (calendarType === 'day') setCurrentDate(subDays(currentDate, 1))
    // 'custom' — prev/next not applicable
  }

  const handleNext = () => {
    if (calendarType === 'month' || viewMode === 'list') setCurrentDate(addMonths(currentDate, 1))
    else if (calendarType === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else if (calendarType === 'day') setCurrentDate(addDays(currentDate, 1))
    // 'custom' — prev/next not applicable
  }

  const formatPeriod = () => {
    if (calendarType === 'custom') {
      if (customStart && customEnd)
        return `${format(customStart, 'dd/MM/yyyy')} – ${format(customEnd, 'dd/MM/yyyy')}`
      return 'Período personalizado'
    }
    if (calendarType === 'month' || viewMode === 'list') {
      const formatted = format(currentDate, 'MMMM yyyy', { locale: ptBR })
      return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }
    if (calendarType === 'week') return `Semana ${format(currentDate, 'dd/MM')}`
    return format(currentDate, 'dd/MM/yyyy')
  }

  const filteredAgendamentos = agendamentos.filter(
    (a) =>
      a.paciente_nome.toLowerCase().includes(search.toLowerCase()) ||
      (a.paciente_telefone && a.paciente_telefone.includes(search)),
  )

  const filteredReservas = search
    ? reservas.filter(
        (r) =>
          filteredAgendamentos.some((a) => a.reserva_id === r.id) ||
          r.expand?.sala_id?.nome.toLowerCase().includes(search.toLowerCase()),
      )
    : reservas

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#05807f]">Meu Calendário</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas reservas e pacientes.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1" onClick={() => setBookingOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Reserva
            </Button>
            <Button
              className="bg-[#05807f] hover:bg-[#05807f]/90 text-white flex-1"
              onClick={() => {
                setPreSelectedReservaId(undefined)
                setAgendamentoOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Consulta
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-3 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="bg-muted/50 border">
                <TabsTrigger value="calendar">
                  <CalendarIcon className="w-4 h-4 mr-2" /> Calendário
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="w-4 h-4 mr-2" /> Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {viewMode === 'calendar' && (
              <Tabs value={calendarType} onValueChange={(v) => setCalendarType(v as any)}>
                <TabsList className="bg-muted/50 border">
                  <TabsTrigger value="day">Dia</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                  <TabsTrigger value="custom">
                    <CalendarRange className="w-3.5 h-3.5 mr-1" /> Período
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {calendarType !== 'custom' && (
              <div className="flex items-center gap-2 bg-muted/20 rounded-lg border p-1 w-full sm:w-auto justify-between sm:justify-start">
                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-sm w-36 text-center text-[#05807f]">
                  {formatPeriod()}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            {/* Custom period pickers */}
            {calendarType === 'custom' && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      {customStart ? format(customStart, 'dd/MM/yyyy') : 'Início'}
                    </Button>
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
                <span className="text-muted-foreground text-xs">até</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      {customEnd ? format(customEnd, 'dd/MM/yyyy') : 'Fim'}
                    </Button>
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
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente ou sala..."
                className="pl-9 bg-muted/20 border-border/50 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-none bg-transparent md:bg-card md:border md:shadow-sm">
        <CardContent className="p-0 md:p-6">
          {viewMode === 'list' ? (
            <MedicoListView
              reservas={filteredReservas}
              agendamentos={filteredAgendamentos}
              onOpenAgendamento={(id) => {
                setPreSelectedReservaId(id)
                setAgendamentoOpen(true)
              }}
              onSelectReserva={(r) => {
                setSelectedReserva(r)
                setReservaDetailsOpen(true)
              }}
              onSelectAgendamento={(a) => {
                setSelectedAgendamento(a)
                setAgendamentoDetailsOpen(true)
              }}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="w-full overflow-x-auto pb-4">
              {calendarType === 'day' && (
                <MedicoDayView
                  date={currentDate}
                  reservas={filteredReservas}
                  agendamentos={filteredAgendamentos}
                  onSelectReserva={(r) => {
                    setSelectedReserva(r)
                    setReservaDetailsOpen(true)
                  }}
                  onSelectAgendamento={(a) => {
                    setSelectedAgendamento(a)
                    setAgendamentoDetailsOpen(true)
                  }}
                  onStatusChange={handleStatusChange}
                />
              )}
              {calendarType === 'week' && (
                <MedicoWeekView
                  date={currentDate}
                  reservas={filteredReservas}
                  agendamentos={filteredAgendamentos}
                  onSelectReserva={(r) => {
                    setSelectedReserva(r)
                    setReservaDetailsOpen(true)
                  }}
                  onSelectAgendamento={(a) => {
                    setSelectedAgendamento(a)
                    setAgendamentoDetailsOpen(true)
                  }}
                  onDayClick={(d) => {
                    setCurrentDate(d)
                    setCalendarType('day')
                  }}
                  onStatusChange={handleStatusChange}
                />
              )}
              {calendarType === 'month' && (
                <MedicoMonthView
                  date={currentDate}
                  reservas={filteredReservas}
                  agendamentos={filteredAgendamentos}
                  onDayClick={(d) => {
                    setCurrentDate(d)
                    setCalendarType('day')
                  }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <MedicoAgendamentoModal
        open={agendamentoOpen}
        onOpenChange={setAgendamentoOpen}
        medicoId={medico?.id}
        preSelectedReservaId={preSelectedReservaId}
        onSaved={loadData}
        onOpenNovaReserva={() => {
          setAgendamentoOpen(false)
          setBookingOpen(true)
        }}
      />

      <MedicoBookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        medicoId={medico?.id}
        onSaved={loadData}
        onOpenAgendamento={(rId) => {
          setBookingOpen(false)
          setPreSelectedReservaId(rId)
          setAgendamentoOpen(true)
        }}
      />

      <ReservaDetailsModal
        open={reservaDetailsOpen}
        onOpenChange={setReservaDetailsOpen}
        reserva={selectedReserva}
        onOpenAgendamento={(id) => {
          setPreSelectedReservaId(id)
          setAgendamentoOpen(true)
        }}
        onRefresh={loadData}
      />

      <AgendamentoDetailsModal
        open={agendamentoDetailsOpen}
        onOpenChange={setAgendamentoDetailsOpen}
        agendamento={selectedAgendamento}
        onRefresh={loadData}
      />
    </div>
  )
}
