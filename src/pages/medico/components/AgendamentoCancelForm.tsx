import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { deleteAgendamento } from '@/services/agendamentos'
import { format, parseISO } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

interface Props {
  agendamento: any
  onSuccess: () => void
  onCancel: () => void
}

export function AgendamentoCancelForm({ agendamento, onSuccess, onCancel }: Props) {
  const { toast } = useToast()
  const [motivo, setMotivo] = useState('')
  const start = parseISO(agendamento.hora_inicio)

  const handleSave = async () => {
    try {
      await deleteAgendamento(agendamento.id)
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Agendamento cancelado</span>
          </div>
        ) as any,
      })
      onSuccess()
    } catch (e: any) {
      toast({ title: 'Erro ao cancelar', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="bg-red-50 text-red-800 p-4 rounded-lg flex gap-3 items-start border border-red-100">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Tem certeza que deseja cancelar?</h4>
          <p className="text-sm mt-1">
            O agendamento de <strong>{agendamento.paciente_nome}</strong> em{' '}
            <strong>{format(start, 'dd/MM/yyyy')}</strong> às{' '}
            <strong>{format(start, 'HH:mm')}</strong> será removido permanentemente.
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Motivo do Cancelamento (opcional)</Label>
        <Textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Informe o motivo..."
        />
      </div>
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Voltar
        </Button>
        <Button variant="destructive" onClick={handleSave}>
          Confirmar Cancelamento
        </Button>
      </div>
    </div>
  )
}
