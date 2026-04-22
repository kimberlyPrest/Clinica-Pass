import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
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
  const [newPassword, setNewPassword] = useState('')
  const [telefone, setTelefone] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [isMensalista, setIsMensalista] = useState(false)
  const [horarios, setHorarios] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [accessOpen, setAccessOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (medico) {
        setNome(medico.nome || '')
        setEmail(medico.email || '')
        setNewPassword('')
        setTelefone(medico.telefone || '')
        setEspecialidade(medico.especialidade || '')
        setIsMensalista(medico.tipo === 'mensalista')
        setHorarios(medico.horarios_fixos || {})
        setAccessOpen(false)
      } else {
        setNome('')
        setEmail('')
        setPassword('')
        setNewPassword('')
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
      if (medico) {
        const data: any = {
          nome,
          email,
          telefone,
          especialidade,
          tipo: isMensalista ? 'mensalista' : 'avulso',
          horarios_fixos: isMensalista ? horarios : {},
        }
        if (newPassword) {
          data.password = newPassword
          data.passwordConfirm = newPassword
        }
        await updateMedico(medico.id, data)
        toast({ title: 'Médico atualizado com sucesso' })
      } else {
        const data = {
          nome,
          email,
          telefone,
          especialidade,
          tipo: isMensalista ? 'mensalista' : 'avulso',
          horarios_fixos: isMensalista ? horarios : {},
          password,
          passwordConfirm: password,
        }
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

          {medico && (
            <Collapsible open={accessOpen} onOpenChange={setAccessOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full border rounded-lg p-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                <span className="text-sm font-medium">Alterar Acesso ao Sistema</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${accessOpen ? 'rotate-180' : ''}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="border rounded-lg p-4 space-y-4 bg-muted/5">
                  <p className="text-xs text-muted-foreground">
                    Deixe a nova senha em branco para manter a senha atual.
                  </p>
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova senha (opcional)"
                      minLength={8}
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

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
