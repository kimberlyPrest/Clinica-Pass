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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import pb from '@/lib/pocketbase/client'
import { differenceInMinutes, addMinutes, format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { User, Phone, Trash, AlertTriangle, Plus, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  medicoId: string
  preSelectedReservaId?: string
  onSaved: () => void
  onOpenNovaReserva: () => void
}

export function MedicoAgendamentoModal({
  open,
  onOpenChange,
  medicoId,
  preSelectedReservaId,
  onSaved,
  onOpenNovaReserva,
}: Props) {
  const { toast } = useToast()
  const [reservas, setReservas] = useState<any[]>([])
  const [reservaId, setReservaId] = useState('')
  const [pacientes, setPacientes] = useState<
    { nome: string; telefone: string; duration: number }[]
  >([])

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [duration, setDuration] = useState(60)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (open) {
      setPacientes([])
      setNome('')
      setTelefone('')
      setDuration(60)
      const now = new Date().toISOString()
      pb.collection('reservas')
        .getFullList({
          filter: `medico_id="${medicoId}" && status="ativa" && data_fim >= "${now}"`,
          expand: 'sala_id',
          sort: 'data_inicio',
        })
        .then((res) => {
          setReservas(res)
          if (preSelectedReservaId && res.find((r) => r.id === preSelectedReservaId)) {
            setReservaId(preSelectedReservaId)
          } else if (res.length > 0) {
            setReservaId(res[0].id)
          } else {
            setReservaId('')
          }
        })
    }
  }, [open, medicoId, preSelectedReservaId])

  const [existingAgendamentos, setExistingAgendamentos] = useState<any[]>([])

  useEffect(() => {
    if (reservaId && reservaId !== 'none') {
      pb.collection('agendamentos')
        .getFullList({ filter: `reserva_id="${reservaId}" && status != 'cancelada'` })
        .then(setExistingAgendamentos)
    } else {
      setExistingAgendamentos([])
    }
  }, [reservaId])

  useEffect(() => {
    if (nome.length > 2 && showSuggestions) {
      pb.collection('pacientes')
        .getList(1, 5, { filter: `nome ~ "${nome}" && medico_id = "${medicoId}"` })
        .then((res) => {
          setSuggestions(res.items)
        })
    } else {
      setSuggestions([])
    }
  }, [nome, showSuggestions, medicoId])

  const handleSelectSuggestion = (s: any) => {
    setNome(s.nome)
    setTelefone(s.telefone || '')
    setShowSuggestions(false)
  }

  const selectedReserva = reservas.find((r) => r.id === reservaId)
  const totalReservaMins = selectedReserva
    ? differenceInMinutes(new Date(selectedReserva.data_fim), new Date(selectedReserva.data_inicio))
    : 0

  const existingMins = existingAgendamentos.reduce((acc, a) => {
    return acc + differenceInMinutes(new Date(a.hora_fim), new Date(a.hora_inicio))
  }, 0)

  const usedMins = existingMins + pacientes.reduce((acc, p) => acc + p.duration, 0)
  const hasConflict = usedMins > totalReservaMins

  const handleAddPaciente = () => {
    if (!nome || !telefone || !duration) return
    if (duration < 60) {
      toast({
        title: 'Duração mínima da consulta: 1 hora',
        variant: 'destructive',
      })
      return
    }
    const newTotal = usedMins + duration
    if (newTotal > totalReservaMins) {
      toast({
        title: 'Tempo insuficiente',
        description: 'A duração total ultrapassa o tempo disponível na reserva.',
        variant: 'destructive',
      })
      return
    }
    setPacientes([...pacientes, { nome, telefone, duration }])
    setNome('')
    setTelefone('')
    setDuration(60)
  }

  const handleSave = async () => {
    if (!selectedReserva) return

    try {
      let currentStart = new Date(selectedReserva.data_inicio)

      if (existingAgendamentos.length > 0) {
        const lastAgendamento = [...existingAgendamentos].sort(
          (a, b) => new Date(b.hora_fim).getTime() - new Date(a.hora_fim).getTime(),
        )[0]
        currentStart = new Date(lastAgendamento.hora_fim)
      }

      for (const p of pacientes) {
        const end = addMinutes(currentStart, p.duration)

        try {
          await pb
            .collection('pacientes')
            .getFirstListItem(`nome="${p.nome}" && medico_id="${medicoId}"`)
        } catch (_) {
          await pb.collection('pacientes').create({
            nome: p.nome,
            telefone: p.telefone,
            medico_id: medicoId,
          })
        }

        await pb.collection('agendamentos').create({
          reserva_id: selectedReserva.id,
          paciente_nome: p.nome,
          paciente_telefone: p.telefone,
          hora_inicio: currentStart.toISOString(),
          hora_fim: end.toISOString(),
          status: 'confirmado',
        })
        currentStart = end
      }
      toast({ title: 'Agendamentos registrados com sucesso!' })
      onSaved()
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro ao registrar', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Registrar Agendamentos</DialogTitle>
          <DialogDescription>
            Associe pacientes aos seus horários reservados disponíveis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full space-y-2">
              <Label>Selecione a Reserva Base</Label>
              <Select value={reservaId} onValueChange={setReservaId}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Selecione uma reserva ativa" />
                </SelectTrigger>
                <SelectContent>
                  {reservas.length === 0 && (
                    <SelectItem value="none" disabled>
                      Nenhuma reserva futura encontrada
                    </SelectItem>
                  )}
                  {reservas.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {format(new Date(r.data_inicio), 'dd/MM/yyyy HH:mm')} -{' '}
                      {r.expand?.sala_id?.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full sm:w-auto" onClick={onOpenNovaReserva}>
              Criar Nova Reserva
            </Button>
          </div>

          {selectedReserva && (
            <div className="border rounded-xl p-5 space-y-4 bg-[#05807f]/5">
              <h4 className="font-semibold text-sm text-[#05807f]">Adicionar Paciente à Fila</h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 space-y-2 relative">
                  <Label>Nome Completo</Label>
                  <Input
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value)
                      setShowSuggestions(true)
                    }}
                    placeholder="Buscar ou digitar nome"
                    className="bg-background"
                  />
                  {suggestions.length > 0 && showSuggestions && (
                    <div className="absolute top-full left-0 w-full bg-background border rounded-md shadow-lg z-10 mt-1 max-h-40 overflow-y-auto">
                      {suggestions.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 hover:bg-muted cursor-pointer text-sm border-b last:border-0"
                          onClick={() => handleSelectSuggestion(s)}
                        >
                          <div className="font-medium">{s.nome}</div>
                          <div className="text-xs text-muted-foreground">{s.telefone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="bg-background"
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Duração (min)</Label>
                  <Input
                    type="number"
                    min={60}
                    step={15}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="bg-background"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAddPaciente}
                disabled={!nome || !telefone || !duration}
                className="w-full bg-[#05807f] hover:bg-[#05807f]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Registrar na Sessão
              </Button>
            </div>
          )}

          {pacientes.length > 0 && (
            <div className="space-y-3 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <Label className="text-base">Fila de Atendimento</Label>
                <div className="text-sm px-2 py-1 rounded-md bg-muted/50 font-medium">
                  <Clock className="w-4 h-4 inline mr-1 text-[#05807f]" />
                  {usedMins} / {totalReservaMins} min utilizados
                </div>
              </div>

              {hasConflict && (
                <Alert variant="destructive" className="py-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Atenção: O tempo programado atinge ou excede a duração da reserva da sala.
                  </AlertDescription>
                </Alert>
              )}

              <div className="border rounded-lg divide-y">
                {pacientes.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-muted/20">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" /> {p.nome}
                      </div>
                      <div className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        <Phone className="w-3 h-3" /> {p.telefone} <span className="mx-1">•</span>{' '}
                        {p.duration} min
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPacientes(pacientes.filter((_, idx) => idx !== i))}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={pacientes.length === 0}
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
          >
            Salvar Agendamentos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
