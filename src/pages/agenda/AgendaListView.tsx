import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, User, ChevronRight } from 'lucide-react'
import type { Reserva, Agendamento } from '@/services/agenda'

interface Props {
  reservas: Reserva[]
  agendamentos: Agendamento[]
  onSelectReserva: (r: Reserva) => void
}

export default function AgendaListView({ reservas, agendamentos, onSelectReserva }: Props) {
  const sorted = [...reservas].sort(
    (a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <CalendarDays className="w-10 h-10 opacity-30" />
        <p>Nenhuma reserva no período selecionado.</p>
      </div>
    )
  }

  const grouped: Record<string, Reserva[]> = {}
  for (const r of sorted) {
    const day = format(parseISO(r.data_inicio), 'yyyy-MM-dd')
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(r)
  }

  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      {Object.entries(grouped).map(([day, dayReservas]) => (
        <div key={day}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm capitalize text-primary">
              {format(new Date(day + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <div className="flex-1 h-px bg-border/50" />
            <Badge variant="secondary" className="text-xs">
              {dayReservas.length} {dayReservas.length === 1 ? 'reserva' : 'reservas'}
            </Badge>
          </div>

          <div className="space-y-2 pl-6">
            {dayReservas.map((r) => {
              const ags = agendamentos.filter((a) => a.reserva_id === r.id)
              const start = parseISO(r.data_inicio)
              const end = parseISO(r.data_fim)

              return (
                <div
                  key={r.id}
                  className="flex items-start justify-between gap-4 border rounded-lg p-3 bg-card hover:shadow-sm transition-shadow cursor-pointer group"
                  onClick={() => onSelectReserva(r)}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-1 self-stretch rounded-full bg-primary shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold truncate">
                        <User className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{r.expand?.medico_id?.nome || 'Médico'}</span>
                        <span className="text-muted-foreground font-normal">·</span>
                        <span className="text-muted-foreground font-normal truncate">
                          {r.expand?.sala_id?.nome || 'Sala'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                      </div>
                      {ags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {ags.slice(0, 3).map((a) => (
                            <Badge key={a.id} variant="outline" className="text-xs py-0">
                              {a.paciente_nome}
                            </Badge>
                          ))}
                          {ags.length > 3 && (
                            <Badge variant="outline" className="text-xs py-0">
                              +{ags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
