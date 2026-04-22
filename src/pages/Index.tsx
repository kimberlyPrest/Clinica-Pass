import { useState, useEffect, useMemo } from 'react'
import { DashboardFiltersPanel } from '@/components/dashboard/filters'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { AppointmentsTable } from '@/components/dashboard/appointments-table'
import { DashboardFilters } from '@/components/dashboard/types'
import {
  generateDashboardData,
  MOCK_ROOMS,
  MOCK_DOCTOR_TYPES,
} from '@/components/dashboard/mock-data'
import { Bell, SlidersHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function Index() {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'Dia',
    rooms: [...MOCK_ROOMS],
    doctorTypes: [...MOCK_DOCTOR_TYPES],
    occupancy: [0, 100],
  })

  const [tableStatus, setTableStatus] = useState<'loading' | 'success' | 'empty' | 'error'>(
    'loading',
  )

  const dashboardData = useMemo(() => generateDashboardData(filters), [filters])

  useEffect(() => {
    setTableStatus('loading')
    const timer = setTimeout(() => {
      if (Math.random() < 0.05) {
        setTableStatus('error')
      } else if (dashboardData.appointments.length === 0) {
        setTableStatus('empty')
      } else {
        setTableStatus('success')
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [filters, dashboardData.appointments.length])

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
                Acompanhamento de performance da clínica hoje, 24 de Outubro.
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
                <DashboardFiltersPanel filters={filters} onChange={setFilters} />
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
          <KpiGrid data={dashboardData.kpiData} />

          <ChartsSection
            lineData={dashboardData.lineChartData}
            pieData={dashboardData.pieChartData}
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
              >
                VER TODOS
              </Button>
            </div>
            <AppointmentsTable
              data={dashboardData.appointments}
              status={tableStatus}
              onRetry={() => setFilters({ ...filters })}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
