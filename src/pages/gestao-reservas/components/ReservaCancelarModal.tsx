import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { updateReserva } from '@/services/reservas'
import { AlertTriangle } from 'lucide-react'

export function ReservaCancelarModal({ reserva, open, onOpenChange, onSuccess }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  if (!reserva) return null

  const handleCancel = async () => {
    try {
      setLoading(true)
      await updateReserva(reserva.id, { status: 'cancelada' })
      toast({ title: 'Sucesso', description: 'Reserva cancelada com sucesso.' })
      onSuccess()
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível cancelar.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Cancelar Reserva
          </DialogTitle>
          <DialogDescription>Tem certeza que deseja cancelar esta reserva?</DialogDescription>
        </DialogHeader>
        <div className="py-2 text-muted-foreground bg-destructive/10 p-4 rounded-md text-sm border border-destructive/20 mt-2">
          <strong>Aviso:</strong> Todos os agendamentos desta reserva serão afetados ou cancelados.
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
