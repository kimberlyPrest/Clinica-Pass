import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createPaciente, updatePaciente, type Paciente } from '@/services/pacientes'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicoId: string
  paciente?: Paciente | null
  onSaved: () => void
}

export function PacienteModal({ open, onOpenChange, medicoId, paciente, onSaved }: Props) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [medicos, setMedicos] = useState<any[]>([])

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    data_nascimento: '',
    cpf: '',
    email: '',
    endereco: '',
    anamnese: '',
    medicacoes: '',
    notas_internas: '',
    medico_id: medicoId,
  })

  useEffect(() => {
    if (open) {
      if (paciente) {
        setFormData({
          nome: paciente.nome,
          telefone: paciente.telefone,
          data_nascimento: paciente.data_nascimento?.split('T')[0] || '',
          cpf: paciente.cpf || '',
          email: paciente.email || '',
          endereco: paciente.endereco || '',
          anamnese: paciente.anamnese || '',
          medicacoes: paciente.medicacoes || '',
          notas_internas: paciente.notas_internas || '',
          medico_id: paciente.medico_id,
        })
      } else {
        setFormData({
          nome: '',
          telefone: '',
          data_nascimento: '',
          cpf: '',
          email: '',
          endereco: '',
          anamnese: '',
          medicacoes: '',
          notas_internas: '',
          medico_id: medicoId,
        })
      }

      if (user?.tipo_acesso === 'clinica') {
        pb.collection('medicos')
          .getFullList()
          .then(setMedicos)
          .catch(() => {})
      }
    }
  }, [open, paciente, medicoId, user])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length <= 11) {
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
      v = v.replace(/(\d)(\d{4})$/, '$1-$2')
      handleChange('telefone', v)
    }
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      handleChange('cpf', v)
    }
  }

  const handleSave = async () => {
    if (
      !formData.nome ||
      !formData.telefone ||
      (!formData.medico_id && user?.tipo_acesso === 'clinica')
    ) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        ...formData,
        data_nascimento: formData.data_nascimento
          ? new Date(formData.data_nascimento + 'T12:00:00').toISOString()
          : '',
      }

      if (paciente) {
        await updatePaciente(paciente.id, dataToSave)
        toast({ title: 'Paciente atualizado' })
      } else {
        await createPaciente(dataToSave)
        toast({ title: 'Paciente registrado' })
      }
      onSaved()
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#05807f]">
            {paciente ? 'Editar Paciente' : 'Novo Paciente'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.tipo_acesso === 'clinica' && (
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Médico Responsável <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.medico_id}
                  onValueChange={(v) => handleChange('medico_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um médico" />
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
            )}

            <div className="space-y-2">
              <Label>
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>
                Telefone (WhatsApp) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.telefone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleChange('data_nascimento', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={formData.cpf} onChange={handleCpfChange} placeholder="000.000.000-00" />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Input
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-gray-700">Informações Clínicas</h4>

            <div className="space-y-2">
              <Label>Anamnese / Histórico Principal</Label>
              <Textarea
                value={formData.anamnese}
                onChange={(e) => handleChange('anamnese', e.target.value)}
                className="min-h-[100px]"
                placeholder="Descreva o histórico do paciente..."
              />
            </div>

            <div className="space-y-2">
              <Label>Medicações em Uso</Label>
              <Textarea
                value={formData.medicacoes}
                onChange={(e) => handleChange('medicacoes', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Notas Internas (Privado)</Label>
              <Textarea
                value={formData.notas_internas}
                onChange={(e) => handleChange('notas_internas', e.target.value)}
                className="min-h-[80px] bg-amber-50"
                placeholder="Anotações visíveis apenas para a clínica..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
          >
            {saving ? 'Salvando...' : 'Salvar Paciente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
