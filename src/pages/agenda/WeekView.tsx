import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Reserva } from '@/services/agenda'

interface WeekViewProps {
  date: Date
  reservas: Reserva[]
  onSelectReserva: (r: Reserva) => void
  onDayClick: (d: Date) => void
}

export default function WeekView({ date, reservas, onSelectReserva, onDayClick }: WeekViewProps) {
  const start = startOfWeek(date)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <div className="flex-1 flex overflow-auto">
      {days.map((d) => {
        const dayReservas = reservas
          .filter((r) => isSameDay(new Date(r.data_inicio), d))
          .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio))
        return (
          <div
            key={d.toString()}
            className="flex-1 min-w-[150px] border-r flex flex-col last:border-r-0"
          >
            <div
              className="p-3 text-center border-b bg-background sticky top-0 font-medium cursor-pointer hover:bg-muted/50 z-10 transition-colors"
              onClick={() => onDayClick(d)}
            >
              <div className="text-sm text-muted-foreground capitalize">
                {format(d, 'EEEE', { locale: ptBR })}
              </div>
              <div className="text-lg font-bold mt-1">{format(d, 'dd')}</div>
            </div>
            <div className="flex-1 p-2 space-y-2 bg-[#f7e6dc]/20">
              {dayReservas.length === 0 && (
                <div className="text-center text-xs text-muted-foreground mt-4 opacity-50">
                  Livre
                </div>
              )}
              {dayReservas.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onSelectReserva(r)}
                  className="bg-white border rounded-md p-2.5 text-xs shadow-sm cursor-pointer hover:border-[#05807f] transition-all animate-fade-in-up"
                >
                  <div className="font-semibold text-[#05807f] truncate mb-1">
                    {r.expand?.medico_id?.nome}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {format(new Date(r.data_inicio), 'HH:mm')} -{' '}
                    {format(new Date(r.data_fim), 'HH:mm')}
                  </div>
                  <div className="truncate text-muted-foreground mt-1 opacity-80">
                    {r.expand?.sala_id?.nome}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
