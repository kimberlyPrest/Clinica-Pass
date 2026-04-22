import { KpiData } from './types'
import { Card, CardContent } from '@/components/ui/card'
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
      trend: '',
      trendType: 'positive',
      subtext: '',
    },
    {
      title: 'Médicos Ativos',
      value: data.activeDoctors,
      icon: Stethoscope,
      trend: '',
      subtext: '',
    },
    {
      title: 'Salas Disponíveis',
      value: data.availableRooms.toString().padStart(2, '0'),
      icon: DoorOpen,
      trend: data.availableRooms === 0 ? 'Todas ocupadas' : '',
      trendType: 'warning',
      subtext: '',
    },
    {
      title: 'Agendamentos (Próx 7 dias)',
      value: data.upcomingAppointments,
      icon: CalendarDays,
      trend: '',
      trendType: 'positive',
      subtext: '',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/50 shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <Card
          key={i}
          className="relative overflow-hidden animate-fade-in-up border-border/50 shadow-sm rounded-2xl"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-secondary/30 rounded-tl-[100px] -z-10 transform rotate-12" />

          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                <item.icon className="h-6 w-6" />
              </div>
              {item.trend && (
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1',
                    item.trendType === 'positive'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {item.trendType === 'positive' && <TrendingUp className="w-3 h-3" />}
                  {item.trendType === 'warning' && <AlertTriangle className="w-3 h-3" />}
                  {item.trend}
                </span>
              )}
            </div>

            <div>
              <p className="text-sm font-display font-medium text-muted-foreground mb-1">
                {item.title}
              </p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-display font-bold text-foreground">{item.value}</h3>
                {item.subtext && (
                  <span className="text-lg font-medium text-muted-foreground">{item.subtext}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
