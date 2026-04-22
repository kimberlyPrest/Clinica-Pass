import { useState, useEffect } from 'react'
import { PageWrapper, PageHeader, DSCard } from '@/components/ui/design-system'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { AppointmentsTable } from '@/components/dashboard/appointments-table'
import {
  getDashboardKpis,
  getDashboardLineChart,
  getDashboardPieChart,
  getDashboardAppointments,
} from '@/services/dashboard'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Period } from '@/components/dashboard/types'

export default function Index() {
  const [period, setPeriod] = useState<Period>('Mês')
  const [kpis, setKpis] = useState<any>(null)
  const [lineChart, setLineChart] = useState<any[]>([])
  const [pieChart, setPieChart] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [appStatus, setAppStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading')

  const loadData = async () => {
    try {
      setLoading(true)
      setAppStatus('loading')
      const [k, l, p, a] = await Promise.all([
        getDashboardKpis(period),
        getDashboardLineChart(),
        getDashboardPieChart(),
        getDashboardAppointments(),
      ])
      setKpis(k)
      setLineChart(l)
      setPieChart(p)
      setAppointments(a)
      setAppStatus(a.length > 0 ? 'success' : 'empty')
    } catch (e) {
      console.error(e)
      setAppStatus('error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [period])

  useRealtime('reservas', loadData)
  useRealtime('agendamentos', loadData)
  useRealtime('pacientes', loadData)
  useRealtime('salas', loadData)

  return (
    <PageWrapper>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da clínica e atendimentos"
        action={
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dia">Hoje</SelectItem>
              <SelectItem value="Semana">Esta Semana</SelectItem>
              <SelectItem value="Mês">Este Mês</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <div className="space-y-6">
        <KpiGrid data={kpis || {}} loading={loading} />
        <ChartsSection lineData={lineChart} pieData={pieChart} loading={loading} />
        <DSCard padded={false}>
          <div className="p-6 border-b border-[#e6e8ea]">
            <h3 className="text-lg font-bold font-display text-[#191c1e]">Próximos Agendamentos</h3>
          </div>
          <div className="p-0">
            <AppointmentsTable data={appointments} status={appStatus} onRetry={loadData} />
          </div>
        </DSCard>
      </div>
    </PageWrapper>
  )
}
