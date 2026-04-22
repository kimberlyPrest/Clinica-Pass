import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parseISO, format, addMinutes } from 'date-fns'
import { updateAgendamento, getAgendamentosPorReserva } from '@/services/agendamentos'
import { getReservasPorMedicoAtivas } from '@/services/reservas'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  agendamento: any
  onSuccess: () => void
  onCancel: () => void
  setIsDirty: (v: boolean) => void
}

export function AgendamentoRescheduleForm({ agendamento, onSuccess, onCancel, setIsDirty }: Props) {
  const { toast } = useToast()
  const start = parseISO(agendamento.hora_inicio)
  const end = parseISO(agendamento.hora_fim)
  const duracaoInicial = String((end.getTime() - start.getTime()) / (1000 * 60 * 60))

  const [reservas, setReservas] = useState<any[]>([])
  const [novaReservaId, setNovaReservaId] = useState(agendamento.reserva_id)
  const [novaHora, setNovaHora] = useState(format(start, 'HH:mm'))
  const [novaDuracao, setNovaDuracao] = useState(duracaoInicial)
  const [motivo, setMotivo] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    pb.collection('reservas')
      .getOne(agendamento.reserva_id)
      .then((r) => {
        getReservasPorMedicoAtivas(r.medico_id)
          .then(setReservas)
          .catch(() => {})
      })
      .catch(() => {})
  }, [agendamento.reserva_id])

  const handleChange = (setter: any) => (val: string) => {
    setter(val)
    setIsDirty(true)
    setErrors({})
  }

  const handleSave = async () => {
    const err: any = {}
    if (!novaReservaId) err.novaReservaId = 'Selecione uma reserva'
    if (!novaHora) err.novaHora = 'Hora é obrigatória'
    if (!novaDuracao || Number(novaDuracao) < 1) err.novaDuracao = 'Mínimo de 1 hora'
    if (Object.keys(err).length > 0) return setErrors(err)

    const selectedReserva = reservas.find((r) => r.id === novaReservaId)
    if (!selectedReserva) return

    const resDate = selectedReserva.data_inicio.split(' ')[0]
    const newStart = new Date(`${resDate}T${novaHora}:00`)
    const newEnd = addMinutes(newStart, Number(novaDuracao) * 60)
    const resStart = parseISO(selectedReserva.data_inicio)
    const resEnd = parseISO(selectedReserva.data_fim)

    if (newStart < resStart || newEnd > resEnd) {
      return setErrors({ novaHora: 'O horário ultrapassa os limites da reserva selecionada.' })
    }

    const agends = await getAgendamentosPorReserva(novaReservaId)
    for (const ag of agends) {
      const s = parseISO(ag.hora_inicio)
      const e = parseISO(ag.hora_fim)
      if (ag.id !== agendamento.id && newStart < e && newEnd > s) {
        return setErrors({ novaHora: 'Conflito com outro agendamento neste horário.' })
      }
    }

    try {
      await updateAgendamento(agendamento.id, {
        reserva_id: novaReservaId,
        hora_inicio: newStart.toISOString(),
        hora_fim: newEnd.toISOString(),
      })
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Agendamento remarcado para {format(newStart, 'dd/MM/yyyy')}</span>
          </div>
        ) as any,
      })
      onSuccess()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="bg-muted/20 p-3 rounded-lg border grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground">Data Atual</div>
          <div className="font-medium">{format(start, 'dd/MM/yyyy')}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Hora Atual</div>
          <div className="font-medium">{format(start, 'HH:mm')}</div>
        </div>
      </div>
      <div className="space-y-1">
        <Label>
          Nova Data (Reserva Ativa) <span className="text-red-500">*</span>
        </Label>
        <Select value={novaReservaId} onValueChange={handleChange(setNovaReservaId)}>
          <SelectTrigger className={errors.novaReservaId ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione uma data/sala" />
          </SelectTrigger>
          <SelectContent>
            {reservas.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {format(parseISO(r.data_inicio), 'dd/MM/yyyy')} - {r.expand?.sala_id?.nome} (
                {format(parseISO(r.data_inicio), 'HH:mm')} às{' '}
                {format(parseISO(r.data_fim), 'HH:mm')})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.novaReservaId && <div className="text-xs text-red-500">{errors.novaReservaId}</div>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>
            Nova Hora <span className="text-red-500">*</span>
          </Label>
          <Input
            type="time"
            value={novaHora}
            onChange={(e) => handleChange(setNovaHora)(e.target.value)}
            className={errors.novaHora ? 'border-red-500' : ''}
          />
          {errors.novaHora && <div className="text-xs text-red-500">{errors.novaHora}</div>}
        </div>
        <div className="space-y-1">
          <Label>
            Nova Duração (h) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="1"
            step="0.5"
            value={novaDuracao}
            onChange={(e) => handleChange(setNovaDuracao)(e.target.value)}
            className={errors.novaDuracao ? 'border-red-500' : ''}
          />
          {errors.novaDuracao && <div className="text-xs text-red-500">{errors.novaDuracao}</div>}
        </div>
      </div>
      <div className="space-y-1">
        <Label>Motivo (opcional)</Label>
        <Textarea
          value={motivo}
          onChange={(e) => handleChange(setMotivo)(e.target.value)}
          placeholder="Motivo da remarcação..."
        />
      </div>
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="bg-[#05807f] text-white" onClick={handleSave}>
          Salvar Remarcação
        </Button>
      </div>
    </div>
  )
}
