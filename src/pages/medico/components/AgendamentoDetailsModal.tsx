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
import { User, Phone, Clock, Calendar, Edit2, XCircle, RefreshCw } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

interface Props {
  agendamento: any
  open: boolean
  onOpenChange: (o: boolean) => void
  onRefresh: () => void
}

export function AgendamentoDetailsModal({ agendamento, open, onOpenChange, onRefresh }: Props) {
  const { toast } = useToast()
  if (!agendamento) return null

  const start = parseISO(agendamento.hora_inicio)
  const end = parseISO(agendamento.hora_fim)

  const handleCancel = async () => {
    if (!confirm('Deseja realmente cancelar esta consulta? O paciente será removido da agenda.'))
      return
    try {
      await pb.collection('agendamentos').delete(agendamento.id)
      toast({ title: 'Consulta cancelada com sucesso' })
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
          <DialogTitle className="text-xl text-[#05807f]">Detalhes da Consulta</DialogTitle>
          <DialogDescription>Gerencie o agendamento do paciente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/20 p-4 rounded-xl border space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#05807f]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#05807f]" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Paciente
                </div>
                <div className="font-bold text-lg">{agendamento.paciente_nome}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium pl-13">
              <Phone className="w-4 h-4" />
              <span>{agendamento.paciente_telefone || 'Telefone não informado'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-lg border">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground font-semibold uppercase">
                  Data
                </div>
                <div className="font-medium text-sm">{format(start, 'dd/MM/yyyy')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-lg border">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground font-semibold uppercase">
                  Horário
                </div>
                <div className="font-medium text-sm">
                  {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between border-t pt-4">
          <Button variant="destructive" className="w-full sm:w-auto" onClick={handleCancel}>
            <XCircle className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1" onClick={handleNotImpl}>
              <RefreshCw className="w-4 h-4 mr-2" /> Remarcar
            </Button>
            <Button variant="outline" className="flex-none px-3" onClick={handleNotImpl}>
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
