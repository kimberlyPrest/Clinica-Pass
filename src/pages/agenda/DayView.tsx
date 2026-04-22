import { differenceInMinutes, startOfDay, parseISO } from 'date-fns'
import type { Reserva, Agendamento } from '@/services/agenda'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface DayViewProps {
  date: Date
  reservas: Reserva[]
  agendamentos: Agendamento[]
  onSelectReserva: (r: Reserva) => void
}

export default function DayView({ date, reservas, agendamentos, onSelectReserva }: DayViewProps) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 9) // 9 to 19

  return (
    <div className="flex-1 overflow-auto relative flex">
      <div className="w-16 flex flex-col border-r bg-background shrink-0 sticky left-0 z-10">
        {hours.map((h) => (
          <div key={h} className="h-20 border-b text-xs text-muted-foreground p-2 text-right">
            {h.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      <div className="flex-1 relative min-w-[500px]">
        {hours.map((h) => (
          <div key={h} className="h-20 border-b border-border/50 w-full" />
        ))}
        {reservas.map((r) => {
          const start = parseISO(r.data_inicio)
          const end = parseISO(r.data_fim)
          const top = Math.max(
            0,
            (differenceInMinutes(start, startOfDay(start)) - 9 * 60) * (80 / 60),
          )
          const height = differenceInMinutes(end, start) * (80 / 60)
          const ags = agendamentos.filter((a) => a.reserva_id === r.id)

          const overlaps = reservas.filter(
            (ro) =>
              ro.id !== r.id && parseISO(ro.data_inicio) < end && parseISO(ro.data_fim) > start,
          )
          const index = overlaps.filter(
            (ro) =>
              ro.data_inicio < r.data_inicio || (ro.data_inicio === r.data_inicio && ro.id < r.id),
          ).length
          const total = overlaps.length + 1
          const width = `calc(${100 / total}% - 16px)`
          const left = `calc(${index * (100 / total)}% + 8px)`

          return (
            <Tooltip key={r.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute bg-[#05807f] text-white rounded-md p-2 text-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#05807f]/50 transition-all shadow-sm z-20 animate-fade-in-up"
                  style={{ top: `${top}px`, height: `${height}px`, width, left }}
                  onClick={() => onSelectReserva(r)}
                >
                  <div className="flex flex-col md:flex-row md:justify-between font-semibold mb-1">
                    <span className="truncate">{r.expand?.medico_id?.nome}</span>
                    <span className="text-xs opacity-90 truncate">{r.expand?.sala_id?.nome}</span>
                  </div>
                  <div className="text-xs opacity-90 space-y-1 hidden md:block">
                    {ags.map((a) => (
                      <div key={a.id} className="truncate">
                        {a.paciente_nome}
                      </div>
                    ))}
                    {ags.length === 0 && <span>Livre</span>}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="font-semibold mb-2">Pacientes:</div>
                {ags.length > 0 ? (
                  ags.map((a) => (
                    <div key={a.id} className="text-xs">
                      {a.paciente_nome} - {a.paciente_telefone}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">Nenhum paciente agendado</div>
                )}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
