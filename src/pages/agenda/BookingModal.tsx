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
import { createReserva, getReservas } from '@/services/reservas'
import {
  getBloqueios,
  verificarHorarioBloqueadoSync,
  isDateFullyBlocked,
  type Bloqueio,
} from '@/services/bloqueios'
import { checkConflict } from '@/lib/businessRules'
import { useToast } from '@/hooks/use-toast'
import { format, addMinutes, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Trash, CalendarIcon, Clock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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

interface Slot {
  date: Date
  time: string
  duration: number
  sala_id: string
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
  const [medicoId, setMedicoId] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])

  const [currentDate, setCurrentDate] = useState<Date | undefined>(
    initialDate ? parseISO(initialDate) : undefined,
  )
  const [currentTime, setCurrentTime] = useState(initialTime ?? '09:00')
  const [duration, setDuration] = useState(1)
  const [salaId, setSalaId] = useState(initialSalaId ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])

  const [timeOpen, setTimeOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setCurrentDate(initialDate ? parseISO(initialDate) : undefined)
      setCurrentTime(initialTime ?? '09:00')
      if (initialSalaId) setSalaId(initialSalaId)
      getBloqueios().then(setBloqueios).catch(console.error)
    }
  }, [open, initialDate, initialTime, initialSalaId])

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
      toast({
        title: 'Duração inválida',
        description: 'A duração deve ser entre 1 e 8 horas',
        variant: 'destructive',
      })
      return
    }

    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const start = new Date(`${dateStr}T${currentTime}`)
    const endCalc = addMinutes(start, duration * 60)

    const blocked = verificarHorarioBloqueadoSync(
      salaId,
      currentDate,
      currentTime,
      format(endCalc, 'HH:mm'),
      bloqueios,
    )

    if (blocked) {
      toast({
        title: 'Sala bloqueada',
        description: 'Este horário está bloqueado. Escolha outro.',
        variant: 'destructive',
      })
      return
    }

    setSlots([...slots, { date: currentDate, time: currentTime, duration, sala_id: salaId }])
    setSalaId('')
    setCurrentDate(undefined)
    setCurrentTime('09:00')
  }

  const handleSave = async () => {
    if (!medicoId || slots.length === 0) return
    setIsSaving(true)

    try {
      const allReservas = await getReservas()
      const allBloqueios = await getBloqueios()

      for (const slot of slots) {
        const dateStr = format(slot.date, 'yyyy-MM-dd')
        const start = new Date(`${dateStr}T${slot.time}`)
        const endCalc = addMinutes(start, slot.duration * 60)
        const sala = salas.find((s) => s.id === slot.sala_id)

        const blocked = verificarHorarioBloqueadoSync(
          slot.sala_id,
          slot.date,
          format(start, 'HH:mm'),
          format(endCalc, 'HH:mm'),
          allBloqueios as any,
        )
        if (blocked) {
          throw new Error(`Sala ${sala?.nome} está bloqueada neste horário`)
        }

        const conflict = checkConflict(start, endCalc, allReservas, slot.sala_id)
        if (conflict) {
          throw new Error(
            `Sala ${sala?.nome} já possui reserva de ${format(
              parseISO(conflict.reserva.data_inicio),
              'HH:mm',
            )} a ${format(
              parseISO(conflict.reserva.data_fim),
              'HH:mm',
            )} em ${format(parseISO(conflict.reserva.data_inicio), 'dd/MM/yyyy')}`,
          )
        }

        await createReserva({
          medico_id: medicoId,
          sala_id: slot.sala_id,
          data_inicio: start.toISOString(),
          data_fim: endCalc.toISOString(),
          status: 'ativa',
        })
      }
      toast({ title: 'Reservas criadas com sucesso' })
      onSaved()
      onOpenChange(false)
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
                <Label>Sala</Label>
                <Select
                  value={salaId}
                  onValueChange={(val) => {
                    setSalaId(val)
                    setCurrentDate(undefined)
                    setCurrentTime('09:00')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                      disabled={!salaId}
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
                      disabled={(d) =>
                        d < startOfDay(new Date()) || isDateFullyBlocked(salaId, d, bloqueios)
                      }
                      initialFocus
                    />
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
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Início</Label>
                <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                      disabled={!salaId || !currentDate}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {currentTime || 'Selecione'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                      {timeOptions.map((time) => {
                        let isBlocked = false
                        if (salaId && currentDate) {
                          const endCalc = addMinutes(
                            new Date(`${format(currentDate, 'yyyy-MM-dd')}T${time}`),
                            duration * 60,
                          )
                          isBlocked = verificarHorarioBloqueadoSync(
                            salaId,
                            currentDate,
                            time,
                            format(endCalc, 'HH:mm'),
                            bloqueios,
                          )
                        }

                        return (
                          <Tooltip key={time}>
                            <TooltipTrigger asChild>
                              <div className={cn(isBlocked && 'cursor-not-allowed opacity-50')}>
                                <Button
                                  variant={currentTime === time ? 'default' : 'outline'}
                                  className="w-full text-xs px-0"
                                  disabled={isBlocked}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setTimeOpen(false)
                                    setCurrentTime(time)
                                  }}
                                >
                                  {time}
                                </Button>
                              </div>
                            </TooltipTrigger>
                            {isBlocked && (
                              <TooltipContent>Sala bloqueada neste horário</TooltipContent>
                            )}
                          </Tooltip>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddSlot}
              className="w-full"
              disabled={!salaId || !currentDate || !currentTime}
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar à lista
            </Button>
          </div>

          {slots.length > 0 && (
            <div className="space-y-2">
              <Label>Horários Selecionados</Label>
              <div className="border rounded-md divide-y">
                {slots.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <span className="font-semibold">{format(s.date, 'dd/MM/yyyy')}</span>
                      <span className="text-muted-foreground ml-2">
                        {s.time} ({s.duration}h) - {salas.find((sa) => sa.id === s.sala_id)?.nome}
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
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!medicoId || slots.length === 0 || isSaving}
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
          >
            {isSaving ? 'Salvando...' : 'Confirmar Reserva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
