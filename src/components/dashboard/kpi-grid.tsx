import { KpiData } from './types'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Stethoscope,
  DoorOpen,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function KpiGrid({ data, loading }: { data: KpiData; loading?: boolean }) {
  const items = [
    {
      title: 'Taxa Ocupação (%)',
      value: `${data.occupancyRate.toFixed(1)}%`,
      icon: LineChart,
      trend: '4.2%',
      trendType: 'positive' as const,
    },
    {
      title: 'Médicos Ativos',
      value: data.activeDoctors,
      icon: Stethoscope,
      trend: '',
      trendType: 'neutral' as const,
    },
    {
      title: 'Salas Disponíveis',
      value: data.availableRooms.toString().padStart(2, '0'),
      icon: DoorOpen,
      trend: data.availableRooms === 0 ? 'Baixa' : '',
      trendType: 'warning' as const,
    },
    {
      title: 'Agendamentos (Próx 7 dias)',
      value: data.upcomingAppointments,
      icon: CalendarDays,
      trend: '12%',
      trendType: 'positive' as const,
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 border border-[#e6e8ea] shadow-[0_2px_4px_rgba(5,128,127,0.04)]"
          >
            <div className="flex justify-between items-start mb-5">
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-28 mb-2" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-white rounded-xl p-6 border border-[#e6e8ea] shadow-[0_2px_4px_rgba(5,128,127,0.04)] group animate-fade-in-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Decorative gradient blob top-right */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-[#f0dfd5] to-[#05807f] opacity-10 rounded-bl-full transition-transform duration-300 group-hover:scale-110 pointer-events-none" />

          <div className="flex items-start justify-between mb-5 relative z-10">
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f0dfd5] to-[#05807f]/80 flex items-center justify-center text-[#05807f] shadow-sm shrink-0">
              <item.icon className="w-5 h-5" />
            </div>

            {/* Trend badge */}
            {item.trend && (
              <span
                className={cn(
                  'text-[11px] font-semibold tracking-wide px-2 py-1 rounded-full flex items-center gap-1',
                  item.trendType === 'positive' &&
                    'bg-[#94f2f0]/30 text-[#006564]',
                  item.trendType === 'warning' &&
                    'bg-destructive/10 text-destructive',
                )}
              >
                {item.trendType === 'positive' && <TrendingUp className="w-3 h-3" />}
                {item.trendType === 'warning' && <AlertTriangle className="w-3 h-3" />}
                {item.trend}
              </span>
            )}
          </div>

          <div className="relative z-10">
            <p className="text-xs font-medium text-[#6e7979] mb-1 tracking-wide">{item.title}</p>
            <h3 className="text-2xl font-bold text-[#191c1e] font-display">{item.value}</h3>
          </div>
        </div>
      ))}
    </div>
  )
}
