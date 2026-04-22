import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Reserva } from '@/services/agenda'
import { cn } from '@/lib/utils'

interface MonthViewProps {
  date: Date
  reservas: Reserva[]
  onDayClick: (d: Date) => void
}

export default function MonthView({ date, reservas, onDayClick }: MonthViewProps) {
  const start = startOfWeek(startOfMonth(date))
  const end = endOfWeek(endOfMonth(date))
  const days = []
  let curr = start
  while (curr <= end) {
    days.push(curr)
    curr = addDays(curr, 1)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 border-b bg-background sticky top-0 z-10 shadow-sm">
        {weekDays.map((d) => (
          <div
            key={d.toString()}
            className="p-3 text-center text-sm font-semibold capitalize text-muted-foreground"
          >
            {format(d, 'EEEE', { locale: ptBR })}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-[#f7e6dc]/10">
        {days.map((d) => {
          const dayReservas = reservas
            .filter((r) => isSameDay(new Date(r.data_inicio), d))
            .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio))
          return (
            <div
              key={d.toString()}
              onClick={() => onDayClick(d)}
              className={cn(
                'border-r border-b p-2 flex flex-col cursor-pointer hover:bg-muted/50 transition-colors min-h-[100px]',
                !isSameMonth(d, date) && 'opacity-40 bg-muted/20',
              )}
            >
              <div
                className={cn(
                  'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-2',
                  isSameDay(d, new Date()) && 'bg-[#05807f] text-white shadow-md',
                )}
              >
                {format(d, 'd')}
              </div>
              <div className="flex-1 space-y-1.5 overflow-hidden">
                {dayReservas.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="text-[10px] truncate bg-[#05807f]/10 text-[#05807f] font-medium px-2 py-1 rounded-sm border border-[#05807f]/20"
                  >
                    {format(new Date(r.data_inicio), 'HH:mm')} {r.expand?.medico_id?.nome}
                  </div>
                ))}
                {dayReservas.length > 3 && (
                  <div className="text-[10px] text-muted-foreground font-medium pl-1">
                    +{dayReservas.length - 3} reservas
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
