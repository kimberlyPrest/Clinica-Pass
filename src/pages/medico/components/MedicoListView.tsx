import { format, parseISO, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Clock, User, AlertCircle, Calendar } from 'lucide-react'

interface Props {
  reservas: any[]
  agendamentos: any[]
  onOpenAgendamento: (id: string) => void
  onSelectReserva: (r: any) => void
  onSelectAgendamento: (a: any) => void
}

export function MedicoListView({
  reservas,
  agendamentos,
  onOpenAgendamento,
  onSelectReserva,
  onSelectAgendamento,
}: Props) {
  const sortedReservas = [...reservas].sort((a, b) => a.data_inicio.localeCompare(b.data_inicio))

  if (sortedReservas.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-white rounded-xl border shadow-sm flex flex-col items-center">
        <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-foreground">Nenhuma reserva encontrada</h3>
        <p className="text-sm mt-1">Não há salas reservadas para o período selecionado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-10">
      {sortedReservas.map((r) => {
        const ags = agendamentos
          .filter((a) => a.reserva_id === r.id)
          .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
        const start = parseISO(r.data_inicio)
        const end = parseISO(r.data_fim)
        const past = isPast(end)
        const isEmpty = ags.length === 0

        return (
          <div
            key={r.id}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isEmpty && !past ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-[#05807f]'} ${past ? 'opacity-60 grayscale' : ''}`}
          >
            <div className="p-4 bg-muted/10 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-background rounded-lg p-2 text-center min-w-[64px] border shadow-sm">
                  <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                    {format(start, 'MMM', { locale: ptBR })}
                  </div>
                  <div className="text-xl font-bold text-[#05807f]">{format(start, 'dd')}</div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="font-semibold text-lg cursor-pointer hover:underline text-foreground"
                      onClick={() => onSelectReserva(r)}
                    >
                      {r.expand?.sala_id?.nome}
                    </span>
                    {isEmpty && !past && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center font-medium">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" /> Sem pacientes
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1.5 font-medium">
                    <span className="flex items-center bg-background px-2 py-1 rounded-md border">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-[#05807f]" />
                      {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
              {isEmpty && !past && (
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm w-full md:w-auto"
                  onClick={() => onOpenAgendamento(r.id)}
                >
                  Agendar Consulta
                </Button>
              )}
              {!isEmpty && !past && (
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => onOpenAgendamento(r.id)}
                >
                  Adicionar Paciente
                </Button>
              )}
            </div>

            {ags.length > 0 && (
              <div className="divide-y bg-background">
                {ags.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-5 hover:bg-muted/30 transition-colors cursor-pointer gap-2"
                    onClick={() => onSelectAgendamento(a)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#05807f] mt-1.5" />
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground" /> {a.paciente_nome}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 ml-5.5 font-medium">
                          {format(parseISO(a.hora_inicio), 'HH:mm')} -{' '}
                          {format(parseISO(a.hora_fim), 'HH:mm')}
                          <span className="mx-1.5">•</span>
                          {a.paciente_telefone || 'Sem telefone'}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] bg-muted px-2 py-1 rounded border uppercase font-bold tracking-wider ml-5 sm:ml-0 self-start sm:self-center">
                      {a.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
