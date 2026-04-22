import { useState } from 'react'
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
import { getBloqueios } from '@/services/bloqueios'
import { checkConflict, checkBlock } from '@/lib/businessRules'
import { useToast } from '@/hooks/use-toast'
import { format, addMinutes, parseISO } from 'date-fns'
import { Plus, Trash } from 'lucide-react'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicos: Medico[]
  salas: Sala[]
  onSaved: () => void
}

interface Slot {
  date: string
  time: string
  duration: number
  sala_id: string
}

export default function BookingModal({
  open,
  onOpenChange,
  medicos,
  salas,
  onSaved,
}: BookingModalProps) {
  const { toast } = useToast()
  const [medicoId, setMedicoId] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])

  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('09:00')
  const [duration, setDuration] = useState(1)
  const [salaId, setSalaId] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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
    setSlots([...slots, { date: currentDate, time: currentTime, duration, sala_id: salaId }])
    setSalaId('')
  }

  const handleSave = async () => {
    if (!medicoId || slots.length === 0) return
    setIsSaving(true)

    try {
      const allReservas = await getReservas()
      const allBloqueios = await getBloqueios()

      for (const slot of slots) {
        const start = new Date(`${slot.date}T${slot.time}`)
        const endCalc = addMinutes(start, slot.duration * 60)
        const sala = salas.find((s) => s.id === slot.sala_id)

        const blocked = checkBlock(start, endCalc, allBloqueios, slot.sala_id)
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
      if (e.message === 'Failed to fetch') {
        toast({ title: 'Erro de conexão. Verifique sua internet.', variant: 'destructive' })
      } else {
        toast({
          title: 'Erro ao salvar. Tente novamente.',
          description: e.message,
          variant: 'destructive',
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Início</Label>
                <Input
                  type="time"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(e.target.value)}
                />
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
                <Label>Sala</Label>
                <Select value={salaId} onValueChange={setSalaId}>
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
            </div>
            <Button type="button" variant="secondary" onClick={handleAddSlot} className="w-full">
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
                      <span className="font-semibold">
                        {format(new Date(s.date + 'T00:00:00'), 'dd/MM/yyyy')}
                      </span>
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
