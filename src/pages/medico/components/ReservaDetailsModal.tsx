import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, MapPin, Edit2, XCircle, Plus } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

interface Props {
  reserva: any
  open: boolean
  onOpenChange: (o: boolean) => void
  onOpenAgendamento: (id: string) => void
  onRefresh: () => void
}

export function ReservaDetailsModal({
  reserva,
  open,
  onOpenChange,
  onOpenAgendamento,
  onRefresh,
}: Props) {
  const { toast } = useToast()
  if (!reserva) return null

  const start = parseISO(reserva.data_inicio)
  const end = parseISO(reserva.data_fim)

  const handleCancel = async () => {
    if (!confirm('Deseja cancelar esta reserva? Isso afetará os agendamentos associados.')) return
    try {
      await pb.collection('reservas').update(reserva.id, { status: 'cancelada' })
      toast({ title: 'Reserva cancelada com sucesso' })
      onOpenChange(false)
      onRefresh()
    } catch (e: any) {
      toast({ title: 'Erro ao cancelar', description: e.message, variant: 'destructive' })
    }
  }

  const handleNotImpl = () =>
    toast({
      title: 'Em desenvolvimento',
      description: 'Esta funcionalidade estará disponível em breve.',
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#05807f]">Detalhes da Reserva</DialogTitle>
          <DialogDescription>Gerencie o horário reservado para a sala.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border">
            <MapPin className="w-5 h-5 text-[#05807f]" />
            <div>
              <div className="text-xs text-muted-foreground font-medium">Sala</div>
              <div className="font-semibold text-base">{reserva.expand?.sala_id?.nome}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border">
              <Calendar className="w-5 h-5 text-[#05807f]" />
              <div>
                <div className="text-xs text-muted-foreground font-medium">Data</div>
                <div className="font-medium">{format(start, 'dd/MM/yyyy')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border">
              <Clock className="w-5 h-5 text-[#05807f]" />
              <div>
                <div className="text-xs text-muted-foreground font-medium">Horário</div>
                <div className="font-medium">
                  {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between border-t pt-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="destructive"
              className="flex-1 sm:flex-none"
              onClick={handleCancel}
              disabled={reserva.status === 'cancelada'}
            >
              <XCircle className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleNotImpl}>
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          <Button
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white w-full sm:w-auto"
            onClick={() => {
              onOpenChange(false)
              onOpenAgendamento(reserva.id)
            }}
            disabled={reserva.status === 'cancelada'}
          >
            <Plus className="w-4 h-4 mr-2" /> Agendar Paciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
