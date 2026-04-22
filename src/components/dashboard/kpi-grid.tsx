import { KpiData } from './types'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Users, Building, CalendarDays } from 'lucide-react'

export function KpiGrid({ data }: { data: KpiData }) {
  const items = [
    { title: 'Taxa Ocupação Geral (%)', value: `${data.occupancyRate}%`, icon: BarChart3 },
    { title: 'Médicos Ativos', value: data.activeDoctors, icon: Users },
    { title: 'Salas Disponíveis Agora', value: data.availableRooms, icon: Building },
    { title: 'Agendamentos Próximos 7 Dias', value: data.upcomingAppointments, icon: CalendarDays },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <Card
          key={i}
          className="animate-fade-in-up border shadow-sm"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-display font-semibold text-muted-foreground mb-2">
                {item.title}
              </p>
              <h3 className="text-4xl font-display font-bold text-primary">{item.value}</h3>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 ml-4">
              <item.icon className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
