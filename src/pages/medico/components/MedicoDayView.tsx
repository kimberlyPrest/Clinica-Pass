import { differenceInMinutes, startOfDay, parseISO, format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Props {
  date: Date
  reservas: any[]
  agendamentos: any[]
  onSelectReserva: (r: any) => void
  onSelectAgendamento: (a: any) => void
  onStatusChange: (id: string, status: string, hora_inicio: string) => void
}

export function MedicoDayView({
  date,
  reservas,
  agendamentos,
  onSelectReserva,
  onSelectAgendamento,
  onStatusChange,
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
                    <Popover key={a.id}>
                      <PopoverTrigger asChild>
                        <div
                          className={cn(
                            'absolute w-[calc(100%-4px)] text-white text-[10px] p-1 rounded cursor-pointer truncate shadow-sm transition-transform hover:scale-[1.02]',
                            a.status === 'confirmado'
                              ? 'bg-green-600 hover:bg-green-700'
                              : a.status === 'pendente'
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-gray-500 hover:bg-gray-600',
                          )}
                          style={{ top: aTop, height: aHeight }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="font-semibold">{a.paciente_nome}</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-64 p-4 z-50 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-bold text-gray-800">{a.paciente_nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(aStart, 'HH:mm')} - {format(aEnd, 'HH:mm')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Sala: {r.expand?.sala_id?.nome}
                            </p>
                          </div>
                          <div className="pt-2 border-t">
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                              Status
                            </label>
                            <Select
                              value={a.status}
                              onValueChange={(val) => onStatusChange(a.id, val, a.hora_inicio)}
                            >
                              <SelectTrigger className="h-8 text-xs font-semibold uppercase">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="pendente"
                                  className="font-semibold text-yellow-700"
                                >
                                  PENDENTE
                                </SelectItem>
                                <SelectItem
                                  value="confirmado"
                                  className="font-semibold text-green-700"
                                >
                                  CONFIRMADO
                                </SelectItem>
                                <SelectItem
                                  value="realizado"
                                  className="font-semibold text-gray-700"
                                >
                                  REALIZADO
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
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
