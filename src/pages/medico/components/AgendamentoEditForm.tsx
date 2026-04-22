import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatPhone } from '@/lib/utils'
import { parseISO, format, addMinutes } from 'date-fns'
import { updateAgendamento, getAgendamentosPorReserva } from '@/services/agendamentos'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { checkConsultasDuration } from '@/lib/businessRules'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  agendamento: any
  onSuccess: () => void
  onCancel: () => void
  setIsDirty: (v: boolean) => void
}

export function AgendamentoEditForm({ agendamento, onSuccess, onCancel, setIsDirty }: Props) {
  const { toast } = useToast()
  const start = parseISO(agendamento.hora_inicio)
  const end = parseISO(agendamento.hora_fim)
  const duracaoInicial = String((end.getTime() - start.getTime()) / (1000 * 60 * 60))

  const [telefone, setTelefone] = useState(agendamento.paciente_telefone || '')
  const [data, setData] = useState(format(start, 'yyyy-MM-dd'))
  const [horaInicio, setHoraInicio] = useState(format(start, 'HH:mm'))
  const [duracao, setDuracao] = useState(duracaoInicial)
  const [status, setStatus] = useState(agendamento.status || 'pendente')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [reserva, setReserva] = useState<any>(null)
  const [overflowDialog, setOverflowDialog] = useState<{
    open: boolean
    minutosExcedidos: number
    pendingFn: (() => Promise<void>) | null
  }>({ open: false, minutosExcedidos: 0, pendingFn: null })

  useEffect(() => {
    pb.collection('reservas')
      .getOne(agendamento.reserva_id)
      .then(setReserva)
      .catch(() => {})
  }, [agendamento.reserva_id])

  const handleChange = (setter: any) => (val: string) => {
    setter(val)
    setIsDirty(true)
    setErrors({})
  }

  const handleSave = async () => {
    const err: any = {}
    if (!telefone) err.telefone = 'Telefone é obrigatório'
    if (!data) err.data = 'Data é obrigatória'
    if (!horaInicio) err.horaInicio = 'Hora é obrigatória'
    if (!duracao || Number(duracao) < 1) err.duracao = 'Mínimo de 1 hora'
    if (Object.keys(err).length > 0) return setErrors(err)

    const newStart = new Date(`${data}T${horaInicio}:00`)
    const newEnd = addMinutes(newStart, Number(duracao) * 60)

    if (reserva) {
      const resStart = parseISO(reserva.data_inicio)
      const resEnd = parseISO(reserva.data_fim)
      if (newStart < resStart || newEnd > resEnd) {
        return setErrors({ horaInicio: 'O horário ultrapassa os limites da reserva.' })
      }
      if (data !== format(resStart, 'yyyy-MM-dd')) {
        return setErrors({ data: 'A data deve coincidir com a reserva atual.' })
      }

      const agends = await getAgendamentosPorReserva(reserva.id)
      for (const ag of agends) {
        const s = parseISO(ag.hora_inicio)
        const e = parseISO(ag.hora_fim)
        if (ag.id !== agendamento.id && newStart < e && newEnd > s) {
          return setErrors({ horaInicio: 'Conflito com outro agendamento neste horário.' })
        }
      }

      const check = checkConsultasDuration(
        agends,
        { inicio: newStart, fim: newEnd },
        reserva,
        agendamento.id,
      )

      if (check.excede) {
        const doUpdate = async () => {
          await updateAgendamento(agendamento.id, {
            paciente_telefone: telefone,
            hora_inicio: newStart.toISOString(),
            hora_fim: newEnd.toISOString(),
            status,
          })
          toast({
            title: (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Agendamento atualizado</span>
              </div>
            ) as any,
          })
          onSuccess()
        }
        setOverflowDialog({
          open: true,
          minutosExcedidos: check.minutosExcedidos,
          pendingFn: doUpdate,
        })
        return
      }
    }

    try {
      await updateAgendamento(agendamento.id, {
        paciente_telefone: telefone,
        hora_inicio: newStart.toISOString(),
        hora_fim: newEnd.toISOString(),
        status,
      })
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Agendamento atualizado</span>
          </div>
        ) as any,
      })
      onSuccess()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="bg-muted/20 p-3 rounded-lg border">
          <div className="text-xs text-muted-foreground uppercase">Paciente (Apenas Leitura)</div>
          <div className="font-medium">{agendamento.paciente_nome}</div>
        </div>
        <div className="space-y-1">
          <Label>
            Telefone <span className="text-red-500">*</span>
          </Label>
          <Input
            value={telefone}
            onChange={(e) => handleChange(setTelefone)(formatPhone(e.target.value))}
            className={errors.telefone ? 'border-red-500' : ''}
          />
          {errors.telefone && <div className="text-xs text-red-500">{errors.telefone}</div>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>
              Data <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={data}
              onChange={(e) => handleChange(setData)(e.target.value)}
              className={errors.data ? 'border-red-500' : ''}
            />
            {errors.data && <div className="text-xs text-red-500">{errors.data}</div>}
          </div>
          <div className="space-y-1">
            <Label>
              Hora Início <span className="text-red-500">*</span>
            </Label>
            <Input
              type="time"
              value={horaInicio}
              onChange={(e) => handleChange(setHoraInicio)(e.target.value)}
              className={errors.horaInicio ? 'border-red-500' : ''}
            />
            {errors.horaInicio && <div className="text-xs text-red-500">{errors.horaInicio}</div>}
          </div>
          <div className="space-y-1">
            <Label>
              Duração (horas) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              step="0.5"
              value={duracao}
              onChange={(e) => handleChange(setDuracao)(e.target.value)}
              className={errors.duracao ? 'border-red-500' : ''}
            />
            {errors.duracao && <div className="text-xs text-red-500">{errors.duracao}</div>}
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={handleChange(setStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="bg-[#05807f] text-white" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </div>

      <AlertDialog
        open={overflowDialog.open}
        onOpenChange={(open) => setOverflowDialog((p) => ({ ...p, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tempo da Reserva Excedido</AlertDialogTitle>
            <AlertDialogDescription>
              Esta consulta ultrapassa o tempo reservado em{' '}
              <strong>{overflowDialog.minutosExcedidos} minutos</strong>. O que deseja fazer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Ajustar Duração</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#05807f] hover:bg-[#05807f]/90"
              onClick={async () => {
                if (overflowDialog.pendingFn) await overflowDialog.pendingFn()
                setOverflowDialog((p) => ({ ...p, open: false }))
              }}
            >
              Salvar Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
