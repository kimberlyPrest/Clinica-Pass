import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateReserva } from '@/services/reservas'
import { format, differenceInMinutes, parse } from 'date-fns'

export function ReservaEditarModal({ reserva, agendamentos, open, onOpenChange, onSuccess }: any) {
  const { toast } = useToast()
  const [data, setData] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (reserva) {
      setData(format(new Date(reserva.data_inicio), 'yyyy-MM-dd'))
      setHoraInicio(format(new Date(reserva.data_inicio), 'HH:mm'))
      setHoraFim(format(new Date(reserva.data_fim), 'HH:mm'))
    }
  }, [reserva])

  const handleSave = async () => {
    try {
      setLoading(true)
      const start = parse(`${data} ${horaInicio}`, 'yyyy-MM-dd HH:mm', new Date())
      const end = parse(`${data} ${horaFim}`, 'yyyy-MM-dd HH:mm', new Date())

      const diff = differenceInMinutes(end, start)
      if (diff <= 0) {
        toast({
          title: 'Erro',
          description: 'Hora final deve ser maior que inicial.',
          variant: 'destructive',
        })
        return
      }

      const related = agendamentos.filter((a: any) => a.reserva_id === reserva.id)
      let minDuration = 0
      if (related.length > 0) {
        const lastAgs = [...related].sort(
          (a, b) => new Date(b.hora_fim).getTime() - new Date(a.hora_fim).getTime(),
        )[0]
        const firstAgs = [...related].sort(
          (a, b) => new Date(a.hora_inicio).getTime() - new Date(b.hora_inicio).getTime(),
        )[0]
        minDuration = differenceInMinutes(
          new Date(lastAgs.hora_fim),
          new Date(firstAgs.hora_inicio),
        )
      }

      if (diff < minDuration) {
        toast({
          title: 'Erro',
          description: `Duração mínima exigida: ${minDuration} min (baseado nos agendamentos).`,
          variant: 'destructive',
        })
        return
      }

      await updateReserva(reserva.id, {
        data_inicio: start.toISOString(),
        data_fim: end.toISOString(),
      })
      toast({ title: 'Sucesso', description: 'Reserva atualizada com sucesso.' })
      onSuccess()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a reserva.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Reserva</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora Início</Label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora Fim</Label>
              <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#05807f] hover:bg-[#046666] text-white"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
