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
import { createAgendamento, getAgendamentosPorReserva } from '@/services/agendamentos'
import { updateReserva } from '@/services/reservas'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { checkConsultasDuration } from '@/lib/businessRules'
import { CheckCircle2, User } from 'lucide-react'

interface Props {
  reserva: any
  onSuccess: () => void
  onCancel: () => void
  setIsDirty: (v: boolean) => void
}

export function AgendamentoCreateForm({ reserva, onSuccess, onCancel, setIsDirty }: Props) {
  const { toast } = useToast()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [duracao, setDuracao] = useState('1')
  const [status, setStatus] = useState('confirmado')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [overflowDialog, setOverflowDialog] = useState<{
    open: boolean
    minutosExcedidos: number
    minutosDisponiveis: number
    pendingData: (() => Promise<void>) | null
  }>({ open: false, minutosExcedidos: 0, minutosDisponiveis: 0, pendingData: null })

  const resStart = parseISO(reserva.data_inicio)
  const resEnd = parseISO(reserva.data_fim)

  useEffect(() => {
    pb.collection('pacientes')
      .getFullList({ filter: `medico_id = "${reserva.medico_id}"` })
      .then(setPacientes)
      .catch(() => {})
  }, [reserva])

  const handleNameChange = (val: string) => {
    setNome(val)
    setIsDirty(true)
    setErrors({})
    if (val.length > 1) {
      setFiltered(pacientes.filter((p) => p.nome.toLowerCase().includes(val.toLowerCase())))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectPaciente = (p: any) => {
    setNome(p.nome)
    setTelefone(p.telefone)
    setShowSuggestions(false)
    setErrors({})
    setIsDirty(true)
  }

  const doSave = async (newStart: Date, newEnd: Date) => {
    try {
      const existing = pacientes.find((p) => p.nome.toLowerCase() === nome.toLowerCase())
      if (!existing) {
        await pb.collection('pacientes').create({ medico_id: reserva.medico_id, nome, telefone })
      }
      await createAgendamento({
        reserva_id: reserva.id,
        paciente_nome: nome,
        paciente_telefone: telefone,
        hora_inicio: newStart.toISOString(),
        hora_fim: newEnd.toISOString(),
        status,
      })
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Agendamento criado com sucesso</span>
          </div>
        ) as any,
      })
      onSuccess()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleSave = async () => {
    const err: any = {}
    if (!nome) err.nome = 'Nome é obrigatório'
    if (!telefone) err.telefone = 'Telefone é obrigatório'
    if (!horaInicio) err.horaInicio = 'Hora é obrigatória'
    if (!duracao || Number(duracao) < 1) err.duracao = 'Duração mínima da consulta: 1 hora'
    if (Object.keys(err).length > 0) return setErrors(err)

    const resDate = reserva.data_inicio.split('T')[0] || reserva.data_inicio.split(' ')[0]
    const newStart = new Date(`${resDate}T${horaInicio}:00`)
    const newEnd = addMinutes(newStart, Number(duracao) * 60)

    if (newStart < resStart || newEnd > resEnd) {
      return setErrors({ horaInicio: 'O horário ultrapassa os limites da reserva.' })
    }

    const agends = await getAgendamentosPorReserva(reserva.id)

    for (const ag of agends) {
      const s = parseISO(ag.hora_inicio)
      const e = parseISO(ag.hora_fim)
      if (newStart < e && newEnd > s) {
        return setErrors({ horaInicio: 'Conflito com outro agendamento neste horário.' })
      }
    }

    const check = checkConsultasDuration(agends, { inicio: newStart, fim: newEnd }, reserva)

    if (check.excede) {
      setOverflowDialog({
        open: true,
        minutosExcedidos: check.minutosExcedidos,
        minutosDisponiveis: check.minutosDisponiveis,
        pendingData: () => doSave(newStart, newEnd),
      })
      return
    }

    await doSave(newStart, newEnd)
  }

  const handleExtendReserva = async () => {
    if (!overflowDialog.pendingData) return
    try {
      const newEnd = addMinutes(resEnd, overflowDialog.minutosExcedidos)
      await updateReserva(reserva.id, { data_fim: newEnd.toISOString() })
      await overflowDialog.pendingData()
    } catch (e: any) {
      toast({ title: 'Erro ao estender reserva', description: e.message, variant: 'destructive' })
    }
    setOverflowDialog((p) => ({ ...p, open: false }))
  }

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="bg-[#f7e6dc]/50 p-3 rounded-lg border grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground uppercase">Reserva</div>
            <div className="font-semibold">{reserva.expand?.sala_id?.nome}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase">Data/Hora</div>
            <div className="font-medium">
              {format(resStart, 'dd/MM/yyyy')} ({format(resStart, 'HH:mm')} -{' '}
              {format(resEnd, 'HH:mm')})
            </div>
          </div>
        </div>
        <div className="space-y-1 relative">
          <Label>
            Paciente <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Buscar ou novo paciente..."
            value={nome}
            onChange={(e) => handleNameChange(e.target.value)}
            className={errors.nome ? 'border-red-500' : ''}
          />
          {showSuggestions && filtered.length > 0 && (
            <div className="absolute top-[60px] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="px-3 py-2 hover:bg-[#f7e6dc] cursor-pointer text-sm flex items-center gap-2"
                  onClick={() => selectPaciente(p)}
                >
                  <User className="w-4 h-4 text-[#05807f]" /> <span>{p.nome}</span>{' '}
                  <span className="text-muted-foreground ml-auto">{p.telefone}</span>
                </div>
              ))}
            </div>
          )}
          {errors.nome && <div className="text-xs text-red-500">{errors.nome}</div>}
        </div>
        <div className="space-y-1">
          <Label>
            Telefone <span className="text-red-500">*</span>
          </Label>
          <Input
            value={telefone}
            onChange={(e) => {
              setTelefone(formatPhone(e.target.value))
              setIsDirty(true)
            }}
            className={errors.telefone ? 'border-red-500' : ''}
          />
          {errors.telefone && <div className="text-xs text-red-500">{errors.telefone}</div>}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>
              Hora Início <span className="text-red-500">*</span>
            </Label>
            <Input
              type="time"
              value={horaInicio}
              onChange={(e) => {
                setHoraInicio(e.target.value)
                setIsDirty(true)
              }}
              className={errors.horaInicio ? 'border-red-500' : ''}
            />
            {errors.horaInicio && <div className="text-xs text-red-500">{errors.horaInicio}</div>}
          </div>
          <div className="space-y-1">
            <Label>
              Duração (h) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              step="0.5"
              value={duracao}
              onChange={(e) => {
                setDuracao(e.target.value)
                setIsDirty(true)
              }}
              className={errors.duracao ? 'border-red-500' : ''}
            />
            {errors.duracao && <div className="text-xs text-red-500">{errors.duracao}</div>}
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v)
                setIsDirty(true)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
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
            Criar Agendamento
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
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleExtendReserva}
            >
              Aumentar Reserva
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-[#05807f] hover:bg-[#05807f]/90"
              onClick={async () => {
                if (overflowDialog.pendingData) await overflowDialog.pendingData()
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
