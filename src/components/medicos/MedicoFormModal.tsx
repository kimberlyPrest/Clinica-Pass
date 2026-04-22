import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createMedico, updateMedico, type Medico } from '@/services/medicos'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

interface MedicoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medico?: Medico | null
  onSuccess: () => void
}

const DAYS = [
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
]

const HOURS = Array.from({ length: 11 }, (_, i) => {
  const h = i + 9
  return `${h < 10 ? '0' : ''}${h}:00`
})

export function MedicoFormModal({ open, onOpenChange, medico, onSuccess }: MedicoFormModalProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefone, setTelefone] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [isMensalista, setIsMensalista] = useState(false)
  const [horarios, setHorarios] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (medico) {
        setNome(medico.nome || '')
        setEmail(medico.email || '')
        setTelefone(medico.telefone || '')
        setEspecialidade(medico.especialidade || '')
        setIsMensalista(medico.tipo === 'mensalista')
        setHorarios(medico.horarios_fixos || {})
      } else {
        setNome('')
        setEmail('')
        setPassword('')
        setTelefone('')
        setEspecialidade('')
        setIsMensalista(false)
        setHorarios({})
      }
      setErrors({})
    }
  }, [open, medico])

  const toggleHorario = (day: string, hour: string) => {
    setHorarios((prev) => {
      const dayHours = prev[day] || []
      if (dayHours.includes(hour)) {
        return { ...prev, [day]: dayHours.filter((h) => h !== hour) }
      }
      return { ...prev, [day]: [...dayHours, hour] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const data = {
        nome,
        email,
        telefone,
        especialidade,
        tipo: isMensalista ? 'mensalista' : 'avulso',
        horarios_fixos: isMensalista ? horarios : {},
        password: password || undefined,
      }

      if (medico) {
        await updateMedico(medico.id, data)
        toast({ title: 'Médico atualizado com sucesso' })
      } else {
        await createMedico(data)
        toast({ title: 'Médico salvo com sucesso' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      const fieldErrs = extractFieldErrors(err)
      if (Object.keys(fieldErrs).length > 0) {
        setErrors(fieldErrs)
      } else {
        toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medico ? 'Editar Médico' : 'Novo Médico'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} />
              {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!medico}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            {!medico && (
              <div className="space-y-2">
                <Label>Senha (Inicial)</Label>
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input required value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone}</p>}
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Input
                required
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
              />
              {errors.especialidade && (
                <p className="text-red-500 text-sm">{errors.especialidade}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 border rounded-lg p-4 bg-muted/20">
            <Switch checked={isMensalista} onCheckedChange={setIsMensalista} />
            <Label>Contrato Mensalista</Label>
          </div>

          {isMensalista && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Grade de Horários Fixos</Label>
              <div className="overflow-x-auto">
                <div className="min-w-[600px] border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-6 bg-muted p-2 font-medium text-sm text-center">
                    <div>Hora</div>
                    {DAYS.map((d) => (
                      <div key={d.id}>{d.label}</div>
                    ))}
                  </div>
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="grid grid-cols-6 p-2 text-center text-sm items-center hover:bg-muted/10"
                      >
                        <div className="font-medium text-muted-foreground">{hour}</div>
                        {DAYS.map((day) => {
                          const isSelected = (horarios[day.id] || []).includes(hour)
                          return (
                            <div key={`${day.id}-${hour}`} className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => toggleHorario(day.id, hour)}
                                className={`w-6 h-6 rounded-md transition-colors ${
                                  isSelected
                                    ? 'bg-[#05807f] text-white'
                                    : 'bg-muted hover:bg-muted-foreground/20'
                                }`}
                              >
                                {isSelected ? '✓' : ''}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#05807f] hover:bg-[#05807f]/90">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
