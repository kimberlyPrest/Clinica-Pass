import { differenceInMinutes, startOfDay, parseISO } from 'date-fns'

interface Props {
  date: Date
  reservas: any[]
  agendamentos: any[]
  onSelectReserva: (r: any) => void
  onSelectAgendamento: (a: any) => void
}

export function MedicoDayView({
  date,
  reservas,
  agendamentos,
  onSelectReserva,
  onSelectAgendamento,
}: Props) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8 to 20

  return (
    <div className="flex-1 overflow-auto relative flex bg-white rounded-lg border shadow-sm min-h-[600px] h-[70vh]">
      <div className="w-16 flex flex-col border-r bg-muted/20 shrink-0 sticky left-0 z-10">
        {hours.map((h) => (
          <div key={h} className="h-24 border-b text-xs text-muted-foreground p-2 text-right">
            {h.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      <div className="flex-1 relative min-w-[500px]">
        {hours.map((h) => (
          <div key={h} className="h-24 border-b border-border/50 w-full" />
        ))}
        {reservas.map((r) => {
          const start = parseISO(r.data_inicio)
          const end = parseISO(r.data_fim)
          const top = Math.max(
            0,
            (differenceInMinutes(start, startOfDay(start)) - 8 * 60) * (96 / 60),
          )
          const height = differenceInMinutes(end, start) * (96 / 60)
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
            <div
              key={r.id}
              className="absolute bg-[#f7e6dc] border border-[#05807f]/30 rounded-md p-1 overflow-hidden shadow-sm z-20 transition-all hover:ring-1 ring-[#05807f]"
              style={{ top, height, left, width }}
              onClick={() => onSelectReserva(r)}
            >
              <div className="text-[11px] font-bold text-[#05807f] mb-1 truncate cursor-pointer hover:underline">
                {r.expand?.sala_id?.nome} (Reserva)
              </div>
              <div className="relative h-full w-full">
                {ags.map((a) => {
                  const aStart = parseISO(a.hora_inicio)
                  const aEnd = parseISO(a.hora_fim)
                  const aTop = differenceInMinutes(aStart, start) * (96 / 60)
                  const aHeight = differenceInMinutes(aEnd, aStart) * (96 / 60)
                  return (
                    <div
                      key={a.id}
                      className="absolute w-[calc(100%-4px)] bg-[#05807f] text-white text-[10px] p-1 rounded cursor-pointer hover:bg-[#05807f]/90 truncate shadow-sm transition-transform hover:scale-[1.02]"
                      style={{ top: aTop, height: aHeight }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectAgendamento(a)
                      }}
                    >
                      <span className="font-semibold">{a.paciente_nome}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
