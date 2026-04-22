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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-2 mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary">
            Dashboard Clínica
          </h1>
          <p className="text-muted-foreground">
            Monitore a ocupação, médicos e agendamentos em tempo real.
          </p>
        </header>

        <section className="space-y-6">
          <DashboardFiltersPanel filters={filters} onChange={setFilters} />

          <KpiGrid data={dashboardData.kpiData} />

          <ChartsSection
            lineData={dashboardData.lineChartData}
            pieData={dashboardData.pieChartData}
          />

          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mt-8">
              <h2 className="text-xl font-display font-semibold text-primary">
                Próximos Agendamentos
              </h2>
              <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Últimas 24h e Próximas 48h
              </span>
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
