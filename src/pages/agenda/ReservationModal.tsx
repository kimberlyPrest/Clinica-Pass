import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { Reserva, Agendamento } from '@/services/agenda'
import { createAgendamento, updateReserva } from '@/services/agenda'
import { format, parseISO, differenceInMinutes, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { Plus, User, Phone, AlertTriangle, CalendarX2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ReservationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reserva: Reserva
  agendamentos: Agendamento[]
}

export default function ReservationModal({
  open,
  onOpenChange,
  reserva,
  agendamentos,
}: ReservationModalProps) {
  const { toast } = useToast()
  const [isAddingMode, setIsAddingMode] = useState(false)
  const [newPaciente, setNewPaciente] = useState({ nome: '', telefone: '', duration: 60 })

  const start = parseISO(reserva.data_inicio)
  const end = parseISO(reserva.data_fim)
  const totalDuration = differenceInMinutes(end, start)
  const usedDuration = agendamentos.reduce(
    (acc, a) => acc + differenceInMinutes(parseISO(a.hora_fim), parseISO(a.hora_inicio)),
    0,
  )
  const hasExceededDuration = usedDuration > totalDuration

  const handleAddAgendamento = async () => {
    try {
      const aStart = addMinutes(start, usedDuration)
      const aEnd = addMinutes(aStart, newPaciente.duration)

      await createAgendamento({
        reserva_id: reserva.id,
        paciente_nome: newPaciente.nome,
        paciente_telefone: newPaciente.telefone,
        hora_inicio: aStart.toISOString(),
        hora_fim: aEnd.toISOString(),
        status: 'confirmado',
      })
      toast({ title: 'Agendamento adicionado' })
      setIsAddingMode(false)
      setNewPaciente({ nome: '', telefone: '', duration: 60 })
    } catch (e: any) {
      toast({ title: 'Erro ao adicionar', description: e.message, variant: 'destructive' })
    }
  }

  const handleCancel = async () => {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return
    try {
      await updateReserva(reserva.id, { status: 'cancelada' })
      toast({ title: 'Reserva cancelada' })
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro ao cancelar', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            {format(start, "dd 'de' MMMM, yyyy - HH:mm", { locale: ptBR })} às{' '}
            {format(end, 'HH:mm')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
            <div>
              <span className="text-muted-foreground block">Médico</span>
              <span className="font-semibold text-[#05807f]">
                {reserva.expand?.medico_id?.nome}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Sala</span>
              <span className="font-semibold">{reserva.expand?.sala_id?.nome}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Duração Total</span>
              <span>{totalDuration / 60}h</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Ocupado</span>
              <span>{Math.round((usedDuration / 60) * 10) / 10}h</span>
            </div>
          </div>

          {hasExceededDuration && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                O tempo total dos agendamentos excede a duração da reserva.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Pacientes Agendados</h4>
              {!isAddingMode && (
                <Button size="sm" variant="outline" onClick={() => setIsAddingMode(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Agendar
                </Button>
              )}
            </div>

            {isAddingMode && (
              <div className="border rounded-md p-3 space-y-3 bg-muted/10 animate-fade-in-up">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={newPaciente.nome}
                    onChange={(e) => setNewPaciente({ ...newPaciente, nome: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={newPaciente.telefone}
                      onChange={(e) => setNewPaciente({ ...newPaciente, telefone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input
                      type="number"
                      value={newPaciente.duration}
                      onChange={(e) =>
                        setNewPaciente({ ...newPaciente, duration: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingMode(false)}>
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddAgendamento}
                    className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[200px] overflow-auto">
              {agendamentos.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-sm border border-dashed rounded-md">
                  Nenhum paciente agendado
                </div>
              ) : (
                agendamentos.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 border rounded-md text-sm"
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <User className="w-3 h-3" /> {a.paciente_nome}
                      </div>
                      <div className="text-muted-foreground text-xs flex items-center gap-2 mt-1">
                        <Phone className="w-3 h-3" /> {a.paciente_telefone}
                      </div>
                    </div>
                    <div className="text-right text-xs bg-secondary/50 px-2 py-1 rounded">
                      {format(parseISO(a.hora_inicio), 'HH:mm')} -{' '}
                      {format(parseISO(a.hora_fim), 'HH:mm')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="destructive" onClick={handleCancel}>
            <CalendarX2 className="w-4 h-4 mr-2" /> Cancelar Reserva
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
