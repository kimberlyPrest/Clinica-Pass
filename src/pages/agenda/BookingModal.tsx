import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Medico } from '@/services/medicos'
import type { Sala } from '@/services/salas'
import { createReserva, verificarSalasLivres } from '@/services/reservas'
import { useToast } from '@/hooks/use-toast'
import { format, addMinutes, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { Plus, Trash, CalendarIcon, Clock, UserPlus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicos: Medico[]
  salas: Sala[]
  onSaved: () => void
  initialDate?: string
  initialTime?: string
  initialSalaId?: string
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
  sala_id: string
  pacientes: SlotPaciente[]
}

const hours = Array.from({ length: 16 }, (_, i) => i + 7)
const timeOptions = hours.flatMap((h) => [
  `${String(h).padStart(2, '0')}:00`,
  `${String(h).padStart(2, '0')}:30`,
])

export default function BookingModal({
  open,
  onOpenChange,
  medicos,
  salas,
  onSaved,
  initialDate,
  initialTime,
  initialSalaId,
}: BookingModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'select' | 'summary'>('select')
  const [medicoId, setMedicoId] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])

  const [currentDate, setCurrentDate] = useState<Date | undefined>(
    initialDate ? parseISO(initialDate) : undefined,
  )
  const [currentTime, setCurrentTime] = useState(initialTime ?? '09:00')
  const [duration, setDuration] = useState(1)
  const [salaId, setSalaId] = useState('')

  const [availableRooms, setAvailableRooms] = useState<Sala[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [timeOpen, setTimeOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('select')
      setCurrentDate(initialDate ? parseISO(initialDate) : undefined)
      setCurrentTime(initialTime ?? '09:00')
      setSlots([])
    }
  }, [open, initialDate, initialTime])

  useEffect(() => {
    if (currentDate && currentTime && duration >= 1) {
      setIsLoadingRooms(true)
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const start = new Date(`${dateStr}T${currentTime}`)
      const endCalc = addMinutes(start, duration * 60)

      verificarSalasLivres(dateStr, currentTime, format(endCalc, 'HH:mm'))
        .then((salasLivres) => {
          setAvailableRooms(salasLivres as Sala[])
          setIsLoadingRooms(false)
          if (initialSalaId && salasLivres.find((s) => s.id === initialSalaId) && !salaId) {
            setSalaId(initialSalaId)
          } else if (!salasLivres.find((s) => s.id === salaId)) {
            setSalaId('')
          }
        })
        .catch(() => setIsLoadingRooms(false))
    } else {
      setAvailableRooms([])
      setSalaId('')
    }
  }, [currentDate, currentTime, duration, initialSalaId])

  const handleDurationChange = (val: number) => {
    setDuration(val)
    if (val < 1) {
      toast({ title: 'Duração mínima: 1 hora', variant: 'destructive' })
    }
  }

  const handleAddSlot = () => {
    if (!currentDate || !currentTime || !salaId) {
      toast({
        title: 'Campo obrigatório',
        description: 'Preencha todos os campos do horário',
        variant: 'destructive',
      })
      return
    }
    if (duration < 1 || duration > 8) {
      toast({ title: 'Duração mínima: 1 hora', variant: 'destructive' })
      return
    }
    setSlots([
      ...slots,
      { date: currentDate, time: currentTime, duration, sala_id: salaId, pacientes: [] },
    ])
    setSalaId('')
  }

  const handleAddPaciente = (slotIdx: number) => {
    const nome = (document.getElementById(`pNome-${slotIdx}`) as HTMLInputElement).value
    const telefone = (document.getElementById(`pTel-${slotIdx}`) as HTMLInputElement).value
    const dur = Number((document.getElementById(`pDur-${slotIdx}`) as HTMLInputElement).value)

    if (nome && telefone && dur >= 1) {
      const newSlots = [...slots]
      newSlots[slotIdx].pacientes.push({ nome, telefone, duration: dur })
      setSlots(newSlots)
      ;(document.getElementById(`pNome-${slotIdx}`) as HTMLInputElement).value = ''
      ;(document.getElementById(`pTel-${slotIdx}`) as HTMLInputElement).value = ''
    } else if (dur < 1) {
      toast({ title: 'Duração mínima da consulta: 1 hora', variant: 'destructive' })
    } else {
      toast({ title: 'Preencha os campos', variant: 'destructive' })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const slot of slots) {
        const dateStr = format(slot.date, 'yyyy-MM-dd')
        const start = new Date(`${dateStr}T${slot.time}`)
        const endCalc = addMinutes(start, slot.duration * 60)

        const livres = await verificarSalasLivres(dateStr, slot.time, format(endCalc, 'HH:mm'))
        if (!livres.find((s) => s.id === slot.sala_id)) {
          throw new Error(
            `Sala ${salas.find((sa) => sa.id === slot.sala_id)?.nome} foi reservada por outro usuário. Escolha outra.`,
          )
        }

        const res = await createReserva({
          medico_id: medicoId,
          sala_id: slot.sala_id,
          data_inicio: start.toISOString(),
          data_fim: endCalc.toISOString(),
          status: 'ativa',
        })

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
      toast({ title: 'Reserva criada com sucesso' })
      onSaved()
      onOpenChange(false)
      setStep('select')
      setSlots([])
      setMedicoId('')
    } catch (e: any) {
      toast({
        title: 'Erro ao salvar. Tente novamente.',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Manualmente</DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Médico</Label>
              <Select value={medicoId} onValueChange={setMedicoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {medicos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-md p-4 space-y-4 bg-muted/20">
              <h4 className="font-semibold text-sm">Adicionar Horário</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !currentDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentDate ? format(currentDate, 'dd/MM/yyyy') : <span>Selecione</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={(day) => {
                          setCurrentDate(day)
                          setDateOpen(false)
                        }}
                        locale={ptBR}
                        disabled={(d) => d < startOfDay(new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Início</Label>
                  <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start font-normal">
                        <Clock className="mr-2 h-4 w-4" />
                        {currentTime || 'Selecione'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                        {timeOptions.map((t) => (
                          <Button
                            key={t}
                            variant={currentTime === t ? 'default' : 'outline'}
                            className="w-full text-xs px-0"
                            onClick={(e) => {
                              e.preventDefault()
                              setTimeOpen(false)
                              setCurrentTime(t)
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
                  <Label>Duração (h)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    step={0.5}
                    value={duration}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sala</Label>
                  <Select
                    value={salaId}
                    onValueChange={setSalaId}
                    disabled={
                      !currentDate || !currentTime || isLoadingRooms || availableRooms.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingRooms
                            ? 'Buscando...'
                            : !currentDate || !currentTime
                              ? 'Selecione data'
                              : availableRooms.length === 0
                                ? 'Nenhuma disponível'
                                : 'Sala Livre'
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
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddSlot}
                className="w-full"
                disabled={!salaId || !currentDate || !currentTime || duration < 1}
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar à lista
              </Button>
            </div>

            {slots.length > 0 && (
              <div className="space-y-2">
                <Label>Horários Selecionados</Label>
                <div className="border rounded-md divide-y">
                  {slots.map((s, i) => (
                    <div key={i} className="p-3 text-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-[#05807f]">
                            {format(s.date, 'dd/MM/yyyy')}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            {s.time} ({s.duration}h) -{' '}
                            {salas.find((sa) => sa.id === s.sala_id)?.nome}
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
                      <div className="pl-4 border-l bg-muted/10 p-2 rounded">
                        <div className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <UserPlus className="w-3 h-3" /> Pacientes para esta reserva (Opcional)
                        </div>
                        {s.pacientes.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex justify-between items-center text-xs mb-1.5 bg-background p-1.5 rounded border"
                          >
                            <span>
                              {p.nome} - {p.telefone} ({p.duration}h)
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 hover:bg-destructive/10"
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
                            id={`pNome-${i}`}
                            placeholder="Nome"
                            className="h-8 text-xs flex-1"
                          />
                          <Input
                            id={`pTel-${i}`}
                            placeholder="Telefone"
                            className="h-8 text-xs w-28"
                          />
                          <Input
                            id={`pDur-${i}`}
                            type="number"
                            placeholder="Hrs"
                            min="1"
                            step="0.5"
                            className="h-8 text-xs w-16"
                            defaultValue={1}
                          />
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleAddPaciente(i)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Resumo da Confirmação</h3>
            {slots.map((slot, idx) => {
              const totalConsultas = slot.pacientes.reduce((acc, p) => acc + p.duration, 0)
              const exceeds = totalConsultas > slot.duration
              return (
                <div key={idx} className="border p-4 rounded-md space-y-2 bg-muted/20">
                  <p>
                    <strong>Médico:</strong> {medicos.find((m) => m.id === medicoId)?.nome}
                  </p>
                  <p>
                    <strong>Sala:</strong> {salas.find((s) => s.id === slot.sala_id)?.nome}
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
                    <strong>Duração:</strong> {slot.duration} horas
                  </p>

                  <div className="mt-3">
                    <strong className="text-sm block mb-1">Pacientes agendados:</strong>
                    {slot.pacientes.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhum paciente agendado</p>
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
                        Atenção: O total de horas das consultas excede a duração da reserva na sala.
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <DialogFooter className="mt-4 border-t pt-4">
          {step === 'select' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => setStep('summary')}
                disabled={!medicoId || slots.length === 0}
                className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('select')} disabled={isSaving}>
                Voltar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
              >
                {isSaving ? 'Processando...' : 'Confirmar Reserva'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
