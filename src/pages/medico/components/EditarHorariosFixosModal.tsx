import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateMedico, type Medico } from '@/services/medicos'

const DAYS = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
]

interface ScheduleDay {
  active: boolean
  start: string
  end: string
}

interface Props {
  medico: Medico
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditarHorariosFixosModal({ medico, open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [schedule, setSchedule] = useState<Record<string, ScheduleDay>>({})

  useEffect(() => {
    if (medico && open) {
      const initial: Record<string, ScheduleDay> = {}
      DAYS.forEach((day) => {
        const slots = medico.horarios_fixos?.[day.id] || []
        if (slots.length > 0) {
          initial[day.id] = { active: true, start: slots[0], end: slots[slots.length - 1] }
        } else {
          initial[day.id] = { active: false, start: '09:00', end: '18:00' }
        }
      })
      setSchedule(initial)
    }
  }, [medico, open])

  const handleDayChange = (dayId: string, field: keyof ScheduleDay, value: any) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const newHorarios: Record<string, string[]> = {}

      DAYS.forEach((day) => {
        const data = schedule[day.id]
        if (data && data.active && data.start && data.end) {
          const slots: string[] = []
          const startHour = parseInt(data.start.split(':')[0])
          const endHour = parseInt(data.end.split(':')[0])

          if (!isNaN(startHour) && !isNaN(endHour) && startHour <= endHour) {
            for (let i = startHour; i <= endHour; i++) {
              slots.push(`${i.toString().padStart(2, '0')}:00`)
            }
          } else {
            slots.push(data.start, data.end)
          }

          newHorarios[day.id] = slots
        }
      })

      await updateMedico(medico.id, { horarios_fixos: newHorarios })
      toast({ title: 'Horários atualizados com sucesso!' })
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto border-[#bdc9c8]/50 shadow-elevation">
        <DialogHeader>
          <DialogTitle className="text-[#05807f]">Editar Horários Fixos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            {DAYS.map((day) => (
              <div
                key={day.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-border/50 rounded-lg bg-card transition-colors duration-200 hover:border-[#05807f]/30"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Checkbox
                    id={`active-${day.id}`}
                    checked={schedule[day.id]?.active || false}
                    onCheckedChange={(checked) => handleDayChange(day.id, 'active', !!checked)}
                    className="data-[state=checked]:bg-[#05807f] data-[state=checked]:border-[#05807f]"
                  />
                  <Label
                    htmlFor={`active-${day.id}`}
                    className="font-medium cursor-pointer text-foreground"
                  >
                    {day.label}
                  </Label>
                </div>

                {schedule[day.id]?.active && (
                  <div className="flex items-center gap-2 animate-fade-in duration-200">
                    <div className="flex items-center gap-2 bg-[#f0dfd5]/30 p-1.5 rounded-md border border-[#05807f]/10">
                      <Label className="text-xs font-semibold text-[#05807f] w-10">Início</Label>
                      <Input
                        type="time"
                        value={schedule[day.id]?.start || ''}
                        onChange={(e) => handleDayChange(day.id, 'start', e.target.value)}
                        className="w-[100px] h-8 text-sm focus-visible:ring-[#05807f]"
                      />
                    </div>
                    <span className="text-muted-foreground font-medium">-</span>
                    <div className="flex items-center gap-2 bg-[#f0dfd5]/30 p-1.5 rounded-md border border-[#05807f]/10">
                      <Label className="text-xs font-semibold text-[#05807f] w-8">Fim</Label>
                      <Input
                        type="time"
                        value={schedule[day.id]?.end || ''}
                        onChange={(e) => handleDayChange(day.id, 'end', e.target.value)}
                        className="w-[100px] h-8 text-sm focus-visible:ring-[#05807f]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="hover:bg-[#f0dfd5]/50 hover:text-[#05807f] border-[#bdc9c8]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
          >
            {loading ? 'Salvando...' : 'Salvar Horários'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
