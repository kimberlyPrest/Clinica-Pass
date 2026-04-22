import { useState, useEffect } from 'react'
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
import { Calendar, Clock, MapPin, XCircle, Plus, ArrowLeft } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { AgendamentoCreateForm } from './AgendamentoCreateForm'

type Mode = 'view' | 'create'

interface Props {
  reserva: any
  open: boolean
  onOpenChange: (o: boolean) => void
  onOpenAgendamento?: (id: string) => void // Kept for backwards compat if needed
  onRefresh: () => void
}

export function ReservaDetailsModal({ reserva, open, onOpenChange, onRefresh }: Props) {
  const { toast } = useToast()
  const [mode, setMode] = useState<Mode>('view')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (open) {
      setMode('view')
      setIsDirty(false)
    }
  }, [open, reserva])

  if (!reserva) return null

  const handleOpenChange = (val: boolean) => {
    if (!val && isDirty) {
      if (!confirm('Você tem alterações não salvas. Deseja realmente sair?')) return
    }
    onOpenChange(val)
  }

  const handleCancelReserva = async () => {
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

  const renderView = () => {
    const start = parseISO(reserva.data_inicio)
    const end = parseISO(reserva.data_fim)
    return (
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
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between border-t pt-4">
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handleCancelReserva}
            disabled={reserva.status === 'cancelada'}
          >
            <XCircle className="w-4 h-4 mr-2" /> Cancelar Reserva
          </Button>
          <Button
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white w-full sm:w-auto"
            onClick={() => setMode('create')}
            disabled={reserva.status === 'cancelada'}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] w-[90vw] animate-in fade-in-0 duration-200"
        onInteractOutside={(e) => {
          if (isDirty && !confirm('Você tem alterações não salvas. Deseja sair?'))
            e.preventDefault()
        }}
      >
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0">
          {mode === 'create' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                if (!isDirty || confirm('Descartar alterações?')) {
                  setMode('view')
                  setIsDirty(false)
                }
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <DialogTitle className="text-xl text-[#05807f]">
              {mode === 'create' ? 'Agendar Nova Consulta' : 'Detalhes da Reserva'}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {mode === 'view'
                ? 'Gerencie o horário reservado para a sala.'
                : 'Adicione um paciente ao horário disponível nesta reserva.'}
            </DialogDescription>
          </div>
        </DialogHeader>
        {mode === 'view' && renderView()}
        {mode === 'create' && (
          <AgendamentoCreateForm
            reserva={reserva}
            onSuccess={() => {
              setIsDirty(false)
              setMode('view')
              onRefresh()
            }}
            onCancel={() => {
              setMode('view')
              setIsDirty(false)
            }}
            setIsDirty={setIsDirty}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
