import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Props {
  date: Date
  reservas: any[]
  agendamentos: any[]
  onDayClick: (d: Date) => void
}

export function MedicoMonthView({ date, reservas, agendamentos, onDayClick }: Props) {
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
    <div className="flex-1 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden min-h-[600px]">
      <div className="grid grid-cols-7 border-b bg-muted/20">
        {weekDays.map((d) => (
          <div
            key={d.toString()}
            className="p-2 text-center text-xs font-semibold capitalize text-muted-foreground"
          >
            {format(d, 'EEEE', { locale: ptBR })}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((d) => {
          const dayReservas = reservas.filter((r) => isSameDay(parseISO(r.data_inicio), d))
          return (
            <div
              key={d.toString()}
              onClick={() => onDayClick(d)}
              className={cn(
                'border-r border-b p-1.5 flex flex-col cursor-pointer hover:bg-muted/50 transition-colors min-h-[100px]',
                !isSameMonth(d, date) && 'opacity-40 bg-muted/10',
              )}
            >
              <div
                className={cn(
                  'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1',
                  isSameDay(d, new Date()) && 'bg-[#05807f] text-white shadow-sm',
                )}
              >
                {format(d, 'd')}
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayReservas.slice(0, 3).map((r) => {
                  const ags = agendamentos.filter((a) => a.reserva_id === r.id)
                  return (
                    <div
                      key={r.id}
                      className="text-[10px] bg-[#f7e6dc] border border-[#05807f]/20 rounded px-1.5 py-0.5 truncate text-[#05807f] font-medium"
                    >
                      {format(parseISO(r.data_inicio), 'HH:mm')} - {ags.length} cons.
                    </div>
                  )
                })}
                {dayReservas.length > 3 && (
                  <div className="text-[10px] text-muted-foreground font-semibold pl-1">
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
