import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createBloqueio } from '@/services/bloqueios'
import { useToast } from '@/hooks/use-toast'
import type { Medico } from '@/services/medicos'

const DAY_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

interface Props {
  medico: Medico
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MensalistaEditModal({ medico, open, onOpenChange }: Props) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [cancelAll, setCancelAll] = useState(false)
  const [loading, setLoading] = useState(false)

  const horariosDoDia = selectedDate
    ? medico.horarios_fixos?.[DAY_MAP[selectedDate.getDay()]] || []
    : []

  const handleCancel = async () => {
    if (!selectedDate) return
    setLoading(true)
    try {
      if (cancelAll) {
        const dayOfWeek = selectedDate.getDay().toString()
        await createBloqueio({
          sala_id: '',
          tipo: 'semanal',
          dias_semana: [dayOfWeek],
          hora_inicio: horariosDoDia[0] || '09:00',
          hora_fim: horariosDoDia[horariosDoDia.length - 1] || '19:00',
        })
        toast({ title: 'Bloqueio recorrente criado para todos os dias da semana.' })
      } else {
        await createBloqueio({
          sala_id: '',
          tipo: 'pontual',
          data_inicio: format(selectedDate, 'yyyy-MM-dd'),
          hora_inicio: horariosDoDia[0] || '09:00',
          hora_fim: horariosDoDia[horariosDoDia.length - 1] || '19:00',
        })
        toast({
          title: `Bloqueio criado para ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}.`,
        })
      }
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro ao criar bloqueio', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar Horário Fixo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Selecione a data que deseja cancelar:
            </p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              disabled={(date) => date < new Date()}
              className="rounded-lg border"
            />
          </div>

          {selectedDate && (
            <div className="p-3 bg-muted/20 rounded-lg space-y-2">
              <p className="text-sm font-medium">
                Horários fixos em {format(selectedDate, 'EEEE', { locale: ptBR })}:
              </p>
              {horariosDoDia.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {horariosDoDia.map((h) => (
                    <Badge key={h} variant="secondary">
                      {h}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum horário fixo nesse dia.</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Switch checked={cancelAll} onCheckedChange={setCancelAll} id="cancel-all" />
            <Label htmlFor="cancel-all" className="cursor-pointer">
              Cancelar{' '}
              <strong>
                todos os {selectedDate ? format(selectedDate, 'EEEE', { locale: ptBR }) : 'dias'}s
              </strong>{' '}
              recorrentes
            </Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading || !selectedDate || horariosDoDia.length === 0}
            >
              {loading ? 'Salvando...' : 'Confirmar Cancelamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
