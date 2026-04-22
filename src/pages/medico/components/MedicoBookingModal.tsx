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
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format, addHours, startOfDay, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { verificarSalasLivres } from '@/services/reservas'
import { Plus, Trash, CheckCircle, Calendar as CalendarIcon, Clock, UserPlus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  medicoId: string
  onSaved: () => void
  onOpenAgendamento: (reservaId: string) => void
}

interface SlotPaciente {
  nome: string
  telefone: string
  duration: number
}

interface Slot {
  date: Date
  time: string
  duration: number
  salaId: string
  salaNome: string
  pacientes: SlotPaciente[]
}

const hours = Array.from({ length: 16 }, (_, i) => i + 7)
const timeOptions = hours.flatMap((h) => [
  `${String(h).padStart(2, '0')}:00`,
  `${String(h).padStart(2, '0')}:30`,
])

export function MedicoBookingModal({
  open,
  onOpenChange,
  medicoId,
  onSaved,
  onOpenAgendamento,
}: Props) {
  const { toast } = useToast()
  const [step, setStep] = useState<'select' | 'summary' | 'prompt'>('select')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState('09:00')
  const [duration, setDuration] = useState(1)
  const [salaId, setSalaId] = useState('')
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [savedReservas, setSavedReservas] = useState<any[]>([])
  const [timeOpen, setTimeOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('select')
      setSlots([])
      setSavedReservas([])
      setDate(new Date())
      setTime('09:00')
      setDuration(1)
      setSalaId('')
    }
  }, [open])

  useEffect(() => {
    if (date && time && duration >= 1) {
      setIsLoadingRooms(true)
      const dateStr = format(date, 'yyyy-MM-dd')
      const start = new Date(`${dateStr}T${time}`)
      const endCalc = addMinutes(start, duration * 60)

      verificarSalasLivres(dateStr, time, format(endCalc, 'HH:mm'))
        .then((salasLivres) => {
          setAvailableRooms(salasLivres)
          setIsLoadingRooms(false)
          if (!salasLivres.find((s) => s.id === salaId)) {
            setSalaId('')
          }
        })
        .catch(() => setIsLoadingRooms(false))
    } else {
      setAvailableRooms([])
      setSalaId('')
    }
  }, [date, time, duration])

  const handleDurationChange = (val: number) => {
    setDuration(val)
    if (val < 1) toast({ title: 'Duração mínima: 1 hora', variant: 'destructive' })
  }

  const handleAddSlot = async () => {
    if (!date || !time || !salaId) {
      toast({ title: 'Preencha todos os campos do horário', variant: 'destructive' })
      return
    }
    if (duration < 1) {
      toast({ title: 'Duração mínima: 1 hora', variant: 'destructive' })
      return
    }
    const salaNome = availableRooms.find((s) => s.id === salaId)?.nome || ''
    setSlots([...slots, { date, time, duration, salaId, salaNome, pacientes: [] }])
    setSalaId('')
  }

  const handleAddPaciente = (slotIdx: number) => {
    const nome = (document.getElementById(`pNomeM-${slotIdx}`) as HTMLInputElement).value
    const telefone = (document.getElementById(`pTelM-${slotIdx}`) as HTMLInputElement).value
    const dur = Number((document.getElementById(`pDurM-${slotIdx}`) as HTMLInputElement).value)

    if (nome && telefone && dur >= 1) {
      const newSlots = [...slots]
      newSlots[slotIdx].pacientes.push({ nome, telefone, duration: dur })
      setSlots(newSlots)
      ;(document.getElementById(`pNomeM-${slotIdx}`) as HTMLInputElement).value = ''
      ;(document.getElementById(`pTelM-${slotIdx}`) as HTMLInputElement).value = ''
    } else if (dur < 1) {
      toast({ title: 'Duração mínima da consulta: 1 hora', variant: 'destructive' })
    } else {
      toast({ title: 'Preencha os campos', variant: 'destructive' })
    }
  }

  const handleConfirmar = async () => {
    setIsSaving(true)
    try {
      const created = []
      const medicos = await pb.collection('medicos').getFullList()
      const medico = medicos.find((m) => m.id === medicoId)

      for (const slot of slots) {
        const dateStr = format(slot.date, 'yyyy-MM-dd')
        const start = new Date(`${dateStr}T${slot.time}`)
        const end = addHours(start, slot.duration)

        const livres = await verificarSalasLivres(dateStr, slot.time, format(end, 'HH:mm'))
        if (!livres.find((s) => s.id === slot.salaId)) {
          throw new Error(`Sala ${slot.salaNome} foi reservada por outro usuário. Escolha outra.`)
        }

        const res = await pb.collection('reservas').create({
          medico_id: medicoId,
          sala_id: slot.salaId,
          data_inicio: start.toISOString(),
          data_fim: end.toISOString(),
          status: 'ativa',
        })
        created.push(res)

        let currentStart = start
        for (const p of slot.pacientes) {
          const endP = addMinutes(currentStart, p.duration * 60)
          try {
            await pb
              .collection('pacientes')
              .getFirstListItem(`nome="${p.nome}" && medico_id="${medicoId}"`)
          } catch (_) {
            await pb
              .collection('pacientes')
              .create({ nome: p.nome, telefone: p.telefone, medico_id: medicoId })
          }
          await pb.collection('agendamentos').create({
            reserva_id: res.id,
            paciente_nome: p.nome,
            paciente_telefone: p.telefone,
            hora_inicio: currentStart.toISOString(),
            hora_fim: endP.toISOString(),
            status: 'confirmado',
          })
          currentStart = endP
        }
      }
      setSavedReservas(created)
      onSaved()
      setStep('prompt')
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'prompt'
              ? 'Reserva Confirmada!'
              : step === 'summary'
                ? 'Confirmar Reserva'
                : 'Reservar Sala'}
          </DialogTitle>
          <DialogDescription>
            {step === 'prompt'
              ? 'Deseja registrar mais agendamentos de consultas?'
              : 'Selecione a data, horário e sala disponível.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-4">
              <Label className="text-base block">Selecione a Data</Label>
              <div className="border rounded-xl p-3 bg-card shadow-sm flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  locale={ptBR}
                  disabled={(d) => d < startOfDay(new Date())}
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário Inicial</Label>
                  <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start font-normal bg-muted/50"
                        disabled={!date}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {time || 'Selecione'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                        {timeOptions.map((t) => (
                          <Button
                            key={t}
                            variant={time === t ? 'default' : 'outline'}
                            className="w-full text-xs px-0"
                            onClick={(e) => {
                              e.preventDefault()
                              setTimeOpen(false)
                              setTime(t)
                            }}
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Duração (horas)</Label>
                  <Input
                    type="number"
                    min={1}
                    step={0.5}
                    value={duration}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Salas Disponíveis</Label>
                <Select
                  value={salaId}
                  onValueChange={setSalaId}
                  disabled={!date || !time || isLoadingRooms || availableRooms.length === 0}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue
                      placeholder={
                        isLoadingRooms
                          ? 'Buscando...'
                          : !date || !time
                            ? 'Selecione data'
                            : availableRooms.length === 0
                              ? 'Nenhuma sala livre'
                              : 'Escolher Sala'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddSlot}
                disabled={!salaId || !date || !time || duration < 1}
                className="w-full border-[#05807f] text-[#05807f] hover:bg-[#05807f]/10"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar à Lista
              </Button>

              {slots.length > 0 && (
                <div className="mt-4 border rounded-lg divide-y bg-muted/5">
                  {slots.map((s, i) => (
                    <div key={i} className="p-3 text-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#05807f] flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" /> {format(s.date, 'dd/MM/yyyy')}
                          </span>
                          <span className="text-muted-foreground">
                            {s.time} ({s.duration}h) • {s.salaNome}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSlots(slots.filter((_, idx) => idx !== i))}
                        >
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="pl-3 border-l bg-background p-2 rounded">
                        <div className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <UserPlus className="w-3 h-3" /> Pacientes na reserva (Opcional)
                        </div>
                        {s.pacientes.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex justify-between items-center text-xs mb-1.5 border-b pb-1"
                          >
                            <span>
                              {p.nome} - {p.telefone} ({p.duration}h)
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                const newSlots = [...slots]
                                newSlots[i].pacientes.splice(pIdx, 1)
                                setSlots(newSlots)
                              }}
                            >
                              <Trash className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <Input
                            id={`pNomeM-${i}`}
                            placeholder="Nome"
                            className="h-7 text-xs flex-1"
                          />
                          <Input
                            id={`pTelM-${i}`}
                            placeholder="Telefone"
                            className="h-7 text-xs w-28"
                          />
                          <Input
                            id={`pDurM-${i}`}
                            type="number"
                            placeholder="Hrs"
                            min="1"
                            step="0.5"
                            className="h-7 text-xs w-16"
                            defaultValue={1}
                          />
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleAddPaciente(i)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-6 py-4 px-2">
            <div className="grid gap-4">
              {slots.map((slot, idx) => {
                const totalConsultas = slot.pacientes.reduce((acc, p) => acc + p.duration, 0)
                const exceeds = totalConsultas > slot.duration
                return (
                  <div key={idx} className="p-4 border rounded-lg bg-muted/20 space-y-2">
                    <p>
                      <strong>Sala:</strong> {slot.salaNome}
                    </p>
                    <p>
                      <strong>Data:</strong> {format(slot.date, 'dd/MM/yyyy')}
                    </p>
                    <p>
                      <strong>Hora:</strong> {slot.time} às{' '}
                      {format(
                        addMinutes(
                          new Date(`${format(slot.date, 'yyyy-MM-dd')}T${slot.time}`),
                          slot.duration * 60,
                        ),
                        'HH:mm',
                      )}
                    </p>
                    <p>
                      <strong>Duração da Reserva:</strong> {slot.duration} horas
                    </p>

                    <div className="mt-3">
                      <strong className="text-sm block mb-1">Pacientes agendados:</strong>
                      {slot.pacientes.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nenhum paciente</p>
                      ) : (
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {slot.pacientes.map((p, i) => (
                            <li key={i}>
                              {p.nome} - {p.telefone} ({p.duration}h)
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="pt-3 mt-3 border-t border-muted-foreground/20">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          exceeds ? 'text-red-500' : 'text-green-600',
                        )}
                      >
                        Total de horas de consultas: {totalConsultas}h
                      </p>
                      {exceeds && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          Atenção: O total de horas das consultas excede a duração da reserva na
                          sala.
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 'prompt' && (
          <div className="text-center py-10 space-y-6 animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Reservas Confirmadas!</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Suas salas foram reservadas. Deseja registrar novos agendamentos extras agora?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
                Registrar Depois
              </Button>
              <Button
                size="lg"
                className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
                onClick={() => onOpenAgendamento(savedReservas[0]?.id)}
              >
                Gerenciar Agendamentos
              </Button>
            </div>
          </div>
        )}

        {step !== 'prompt' && (
          <DialogFooter className="pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            {step === 'select' ? (
              <Button
                disabled={slots.length === 0}
                onClick={() => setStep('summary')}
                className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
              >
                Continuar
              </Button>
            ) : (
              <Button
                onClick={handleConfirmar}
                disabled={isSaving}
                className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
              >
                {isSaving ? 'Salvando...' : 'Confirmar Reservas'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
