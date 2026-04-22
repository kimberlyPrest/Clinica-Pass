import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  parseISO,
  differenceInMinutes,
  startOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
  onDayClick: (d: Date) => void
  onStatusChange: (id: string, status: string, hora_inicio: string) => void
}

export function MedicoWeekView({
  date,
  reservas,
  agendamentos,
  onSelectReserva,
  onSelectAgendamento,
  onDayClick,
  onStatusChange,
}: Props) {
  const startW = startOfWeek(date)
  const days = Array.from({ length: 7 }, (_, i) => addDays(startW, i))
  const hours = Array.from({ length: 13 }, (_, i) => i + 8)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-lg border shadow-sm min-h-[600px] h-[70vh]">
      <div className="flex border-b bg-muted/20 sticky top-0 z-30">
        <div className="w-12 shrink-0 border-r" />
        {days.map((d) => (
          <div
            key={d.toString()}
            className={`flex-1 p-2 text-center border-r last:border-r-0 cursor-pointer hover:bg-muted/50 transition-colors ${isSameDay(d, new Date()) ? 'bg-[#05807f]/5' : ''}`}
            onClick={() => onDayClick(d)}
          >
            <div
              className={`text-xs capitalize ${isSameDay(d, new Date()) ? 'text-[#05807f] font-bold' : 'text-muted-foreground'}`}
            >
              {format(d, 'EEE', { locale: ptBR })}
            </div>
            <div
              className={`text-sm font-bold ${isSameDay(d, new Date()) ? 'text-[#05807f]' : ''}`}
            >
              {format(d, 'dd')}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto relative flex">
        <div className="w-12 shrink-0 border-r bg-muted/10 sticky left-0 z-20">
          {hours.map((h) => (
            <div
              key={h}
              className="h-16 border-b text-[10px] text-muted-foreground p-1 text-right font-medium"
            >
              {h.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div className="flex-1 flex relative min-w-[700px]">
          {days.map((d, dayIdx) => {
            const dayReservas = reservas.filter((r) => isSameDay(parseISO(r.data_inicio), d))
            return (
              <div key={dayIdx} className="flex-1 border-r last:border-r-0 relative">
                {hours.map((h) => (
                  <div key={h} className="h-16 border-b border-border/50" />
                ))}
                {dayReservas.map((r) => {
                  const start = parseISO(r.data_inicio)
                  const end = parseISO(r.data_fim)
                  const top = Math.max(
                    0,
                    (differenceInMinutes(start, startOfDay(start)) - 8 * 60) * (64 / 60),
                  )
                  const height = differenceInMinutes(end, start) * (64 / 60)
                  const ags = agendamentos.filter((a) => a.reserva_id === r.id)

                  const overlaps = dayReservas.filter(
                    (ro) =>
                      ro.id !== r.id &&
                      parseISO(ro.data_inicio) < end &&
                      parseISO(ro.data_fim) > start,
                  )
                  const index = overlaps.filter(
                    (ro) =>
                      ro.data_inicio < r.data_inicio ||
                      (ro.data_inicio === r.data_inicio && ro.id < r.id),
                  ).length
                  const total = overlaps.length + 1
                  const width = `calc(${100 / total}% - 4px)`
                  const left = `calc(${index * (100 / total)}% + 2px)`

                  return (
                    <div
                      key={r.id}
                      className="absolute bg-[#f7e6dc] border border-[#05807f]/30 rounded p-1 overflow-hidden z-10 transition-all hover:ring-1 ring-[#05807f]"
                      style={{ top, height, left, width }}
                      onClick={() => onSelectReserva(r)}
                    >
                      <div className="text-[10px] font-bold text-[#05807f] truncate cursor-pointer hover:underline">
                        {r.expand?.sala_id?.nome}
                      </div>
                      <div className="relative h-full w-full mt-0.5">
                        {ags.map((a) => {
                          const aStart = parseISO(a.hora_inicio)
                          const aEnd = parseISO(a.hora_fim)
                          const aTop = differenceInMinutes(aStart, start) * (64 / 60)
                          const aHeight = differenceInMinutes(aEnd, aStart) * (64 / 60)
                          return (
                            <Popover key={a.id}>
                              <PopoverTrigger asChild>
                                <div
                                  className={cn(
                                    'absolute w-[calc(100%-2px)] text-white text-[9px] px-1 py-0.5 rounded cursor-pointer truncate shadow-sm transition-transform hover:scale-[1.02]',
                                    a.status === 'confirmado'
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : a.status === 'pendente'
                                        ? 'bg-yellow-500 hover:bg-yellow-600'
                                        : 'bg-gray-500 hover:bg-gray-600',
                                  )}
                                  style={{ top: aTop, height: aHeight }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {a.paciente_nome}
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
                                      onValueChange={(val) =>
                                        onStatusChange(a.id, val, a.hora_inicio)
                                      }
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
