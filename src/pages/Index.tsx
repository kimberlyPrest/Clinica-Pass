import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DashboardFiltersPanel } from '@/components/dashboard/filters'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { AppointmentsTable } from '@/components/dashboard/appointments-table'
import type { DashboardFilters, KpiData, Appointment } from '@/components/dashboard/types'
import {
  getDashboardKpis,
  getDashboardLineChart,
  getDashboardPieChart,
  getDashboardAppointments,
  type LineChartPoint,
  type PieChartPoint,
} from '@/services/dashboard'
import { getSalas } from '@/services/salas'
import { Bell, SlidersHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const DOCTOR_TYPE_OPTIONS = ['Mensalista', 'Avulso']

export default function Index() {
  const [roomOptions, setRoomOptions] = useState<string[]>([])
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'Mês',
    rooms: [],
    doctorTypes: [...DOCTOR_TYPE_OPTIONS],
    occupancy: [0, 100],
  })

  const [kpiData, setKpiData] = useState<KpiData>({
    occupancyRate: 0,
    activeDoctors: 0,
    availableRooms: 0,
    upcomingAppointments: 0,
  })
  const [lineChartData, setLineChartData] = useState<LineChartPoint[]>([])
  const [pieChartData, setPieChartData] = useState<PieChartPoint[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tableStatus, setTableStatus] = useState<'loading' | 'success' | 'empty' | 'error'>(
    'loading',
  )
  const [kpiLoading, setKpiLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(true)

  const loadRooms = useCallback(async () => {
    try {
      const salas = await getSalas()
      const names = salas.map((s) => s.nome)
      setRoomOptions(names)
      setFilters((prev) => ({ ...prev, rooms: names }))
    } catch {
      // silently fail
    }
  }, [])

  const loadKpis = useCallback(async () => {
    setKpiLoading(true)
    try {
      const data = await getDashboardKpis(filters.period)
      setKpiData(data)
    } catch {
      // silently fail
    } finally {
      setKpiLoading(false)
    }
  }, [filters.period])

  const loadCharts = useCallback(async () => {
    setChartsLoading(true)
    try {
      const [line, pie] = await Promise.all([getDashboardLineChart(), getDashboardPieChart()])
      setLineChartData(line)
      const filteredPie =
        filters.rooms.length > 0
          ? pie.filter((p) => filters.rooms.includes(p.name))
          : pie
      setPieChartData(filteredPie)
    } catch {
      // silently fail
    } finally {
      setChartsLoading(false)
    }
  }, [filters.rooms])

  const loadAppointments = useCallback(async () => {
    setTableStatus('loading')
    try {
      const data = await getDashboardAppointments()
      const filtered = data.filter((a) => {
        const roomOk = filters.rooms.length === 0 || filters.rooms.includes(a.room)
        return roomOk
      })
      setAppointments(filtered)
      setTableStatus(filtered.length === 0 ? 'empty' : 'success')
    } catch {
      setTableStatus('error')
    }
  }, [filters.rooms])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  useEffect(() => {
    loadKpis()
  }, [loadKpis])

  useEffect(() => {
    loadCharts()
  }, [loadCharts])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleRetry = () => {
    loadKpis()
    loadCharts()
    loadAppointments()
  }

  const today = format(new Date(), "d 'de' MMMM", { locale: ptBR })

  return (
    <div className="min-h-full bg-background text-foreground p-4 md:p-8 font-sans transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-down">
          <div className="flex items-start gap-4">
            <SidebarTrigger className="md:hidden mt-1" />
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
                Visão Geral
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhamento de performance da clínica hoje, {today}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-card shadow-sm border-none relative"
                >
                  <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[340px] md:w-[600px] p-0 border-border/50 shadow-lg rounded-xl"
                align="end"
              >
                <DashboardFiltersPanel
                  filters={filters}
                  onChange={setFilters}
                  roomOptions={roomOptions}
                  doctorTypeOptions={DOCTOR_TYPE_OPTIONS}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-card shadow-sm border-none"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Avatar className="w-10 h-10 border-2 border-card shadow-sm cursor-pointer">
              <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <section className="space-y-8">
          <KpiGrid data={kpiData} loading={kpiLoading} />

          <ChartsSection
            lineData={lineChartData}
            pieData={pieChartData}
            loading={chartsLoading}
          />

          <div
            className="space-y-4 animate-fade-in-up bg-card p-6 rounded-2xl shadow-sm border border-border/50"
            style={{ animationDelay: '600ms' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Próximos Agendamentos
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Visão das últimas 24h e próximas 48h
                </p>
              </div>
              <Button
                variant="secondary"
                className="bg-secondary/40 hover:bg-secondary/60 text-primary font-bold"
                onClick={handleRetry}
              >
                ATUALIZAR
              </Button>
            </div>
            <AppointmentsTable
              data={appointments}
              status={tableStatus}
              onRetry={handleRetry}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
