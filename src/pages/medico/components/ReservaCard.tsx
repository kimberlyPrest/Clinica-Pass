import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, differenceInMinutes } from 'date-fns'
import { Calendar, Clock, Edit2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Reserva } from '@/services/agenda'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

interface Props {
  reserva: Reserva
  onAgendar: () => void
  onRefresh: () => void
}

export function ReservaCard({ reserva, onAgendar, onRefresh }: Props) {
  const { toast } = useToast()
  const start = new Date(reserva.data_inicio)
  const end = new Date(reserva.data_fim)
  const duration = differenceInMinutes(end, start)
  const hours = Math.floor(duration / 60)
  const mins = duration % 60
  const durationStr = `${hours}h${mins > 0 ? ` ${mins}m` : ''}`

  const handleCancel = async () => {
    if (
      !confirm(
        'Deseja realmente cancelar esta reserva? Os agendamentos associados poderão ser afetados.',
      )
    )
      return
    try {
      await pb.collection('reservas').update(reserva.id, { status: 'cancelada' })
      toast({ title: 'Reserva cancelada' })
      onRefresh()
    } catch (e: any) {
      toast({ title: 'Erro ao cancelar', description: e.message, variant: 'destructive' })
    }
  }

  const handleEdit = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'A edição de reservas estará disponível em breve.',
    })
  }

  return (
    <Card className="hover:shadow-md transition-all duration-300 overflow-hidden group border-l-4 border-l-[#05807f]">
      <CardContent className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">
              {reserva.expand?.sala_id?.nome || 'Sala Desconhecida'}
            </h3>
            <Badge
              variant={reserva.status === 'ativa' ? 'default' : 'secondary'}
              className={reserva.status === 'ativa' ? 'bg-[#05807f]' : ''}
            >
              {reserva.status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <Calendar className="w-4 h-4 text-[#05807f]" />
              {format(start, 'dd/MM/yyyy')}
            </span>
            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <Clock className="w-4 h-4 text-[#05807f]" />
              {format(start, 'HH:mm')} - {format(end, 'HH:mm')} ({durationStr})
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {reserva.status === 'ativa' && (
            <>
              <Button variant="outline" size="sm" onClick={handleEdit} className="hidden sm:flex">
                <Edit2 className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-[#05807f] hover:bg-[#05807f]/90 text-white shadow-sm"
                onClick={onAgendar}
              >
                Agendar Consulta
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
