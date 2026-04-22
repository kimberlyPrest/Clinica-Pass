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
import { format, addHours, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { Plus, Trash, CheckCircle, Calendar as CalendarIcon } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  medicoId: string
  onSaved: () => void
  onOpenAgendamento: (reservaId: string) => void
}

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
  const [salas, setSalas] = useState<any[]>([])
  const [slots, setSlots] = useState<any[]>([])
  const [savedReservas, setSavedReservas] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      setStep('select')
      setSlots([])
      setSavedReservas([])
      pb.collection('salas')
        .getFullList({ filter: "status='ativa'" })
        .then(setSalas)
        .catch(() => {})
    }
  }, [open])

  const handleAddSlot = async () => {
    if (!date || !time || !salaId) {
      toast({ title: 'Preencha todos os campos do horário', variant: 'destructive' })
      return
    }
    const start = new Date(date)
    const [h, m] = time.split(':')
    start.setHours(parseInt(h, 10), parseInt(m, 10), 0)
    const end = addHours(start, duration)

    try {
      const overlaps = await pb.collection('reservas').getFullList({
        filter: `sala_id="${salaId}" && status="ativa" && data_inicio < "${end.toISOString()}" && data_fim > "${start.toISOString()}"`,
      })
      if (overlaps.length > 0) {
        toast({
          title: 'Sala ocupada',
          description: 'Já existe uma reserva para esta sala neste horário.',
          variant: 'destructive',
        })
        return
      }
      const salaNome = salas.find((s) => s.id === salaId)?.nome
      setSlots([...slots, { date, time, duration, salaId, salaNome }])
      setSalaId('')
    } catch (e: any) {
      toast({ title: 'Erro de validação', description: e.message, variant: 'destructive' })
    }
  }

  const handleConfirmar = async () => {
    try {
      const created = []
      for (const slot of slots) {
        const start = new Date(slot.date)
        const [h, m] = slot.time.split(':')
        start.setHours(parseInt(h, 10), parseInt(m, 10), 0)
        const end = addHours(start, slot.duration)

        const res = await pb.collection('reservas').create({
          medico_id: medicoId,
          sala_id: slot.salaId,
          data_inicio: start.toISOString(),
          data_fim: end.toISOString(),
          status: 'ativa',
        })
        created.push(res)
      }
      setSavedReservas(created)
      onSaved()
      setStep('prompt')
    } catch (e: any) {
      toast({ title: 'Erro ao salvar reserva', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'prompt' ? 'Reserva Confirmada!' : 'Reservar Sala'}
          </DialogTitle>
          <DialogDescription>
            Selecione a data, horário e sala para o seu atendimento.
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-3">
              <Label className="text-base">Escolha a Data</Label>
              <div className="border rounded-xl p-3 bg-card shadow-sm flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
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
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração (horas)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sala</Label>
                <Select value={salaId} onValueChange={setSalaId}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Selecione a sala" />
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
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSlot}
                className="w-full border-[#05807f] text-[#05807f] hover:bg-[#05807f]/10"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar à Lista
              </Button>

              {slots.length > 0 && (
                <div className="mt-4 border rounded-lg divide-y bg-muted/10">
                  {slots.map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-3 text-sm">
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
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-6 py-6 px-4">
            <h3 className="text-lg font-semibold border-b pb-2">Resumo das Reservas</h3>
            <div className="grid gap-3">
              {slots.map((s, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg bg-muted/20 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-lg">{format(s.date, 'dd/MM/yyyy')}</div>
                    <div className="text-muted-foreground">{s.salaNome}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#05807f]">{s.time}</div>
                    <div className="text-sm text-muted-foreground">{s.duration} horas</div>
                  </div>
                </div>
              ))}
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
                Suas salas foram reservadas. Deseja registrar seus agendamentos de consultas agora?
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
                Registrar Agendamentos
              </Button>
            </div>
          </div>
        )}

        {step !== 'prompt' && (
          <DialogFooter className="pt-4 border-t mt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
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
                className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
              >
                Confirmar Reservas
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
