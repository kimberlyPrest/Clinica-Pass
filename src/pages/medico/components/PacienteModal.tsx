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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [customFieldsConfig, setCustomFieldsConfig] = useState<any[]>([])

  const isEdit = !!paciente

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    data_nascimento: '',
    cpf: '',
    email: '',
    endereco: '',
    medico_id: medicoId,
  })

  const [customData, setCustomData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (open) {
      const activeMedico = paciente?.medico_id || medicoId
      if (activeMedico) {
        pb.collection('medico_campos_customizados')
          .getFullList({ filter: `medico_id="${activeMedico}" && ativo=true`, sort: 'ordem' })
          .then(setCustomFieldsConfig)
          .catch(() => {})
      }

      if (paciente) {
        setFormData({
          nome: paciente.nome,
          telefone: paciente.telefone,
          data_nascimento: paciente.data_nascimento?.split('T')[0] || '',
          cpf: paciente.cpf || '',
          email: paciente.email || '',
          endereco: paciente.endereco || '',
          medico_id: paciente.medico_id,
        })

        const parsedCustomData = (paciente as any).dados_customizados || {}
        setCustomData({
          Anamnese: paciente.anamnese || parsedCustomData['Anamnese'] || '',
          Medicações: paciente.medicacoes || parsedCustomData['Medicações'] || '',
          'Notas Internas': paciente.notas_internas || parsedCustomData['Notas Internas'] || '',
          'Histórico de Retornos': parsedCustomData['Histórico de Retornos'] || '',
          ...parsedCustomData,
        })
      } else {
        setFormData({
          nome: '',
          telefone: '',
          data_nascimento: '',
          cpf: '',
          email: '',
          endereco: '',
          medico_id: medicoId,
        })
        setCustomData({})
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

  const handleCustomChange = (field: string, value: string) => {
    setCustomData((prev) => ({ ...prev, [field]: value }))
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
      const dataToSave: any = {
        ...formData,
        data_nascimento: formData.data_nascimento
          ? new Date(formData.data_nascimento + 'T12:00:00').toISOString()
          : '',
        anamnese: customData['Anamnese'] || '',
        medicacoes: customData['Medicações'] || '',
        notas_internas: customData['Notas Internas'] || '',
      }

      const restCustomData = { ...customData }
      delete restCustomData['Anamnese']
      delete restCustomData['Medicações']
      delete restCustomData['Notas Internas']
      dataToSave.dados_customizados = restCustomData

      if (paciente) {
        await updatePaciente(paciente.id, dataToSave)
        toast({ title: 'Paciente atualizado com sucesso' })
      } else {
        await createPaciente(dataToSave)
        toast({ title: 'Paciente registrado com sucesso' })
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

        <Tabs defaultValue="dados">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="clinico">Prontuário & Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dados" className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.tipo_acesso === 'clinica' && !isEdit && (
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
                <Input
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  readOnly={isEdit}
                  disabled={isEdit}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Telefone (WhatsApp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  readOnly={isEdit}
                  disabled={isEdit}
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
          </TabsContent>

          <TabsContent value="clinico" className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Histórico de Retornos / Evolução</Label>
                <Textarea
                  value={customData['Histórico de Retornos'] || ''}
                  onChange={(e) => handleCustomChange('Histórico de Retornos', e.target.value)}
                  placeholder="Registre as datas e evoluções do paciente..."
                  className="min-h-[100px] bg-[#f7f9fb]"
                />
              </div>

              {customFieldsConfig.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-700 mt-4 border-t pt-4">Campos Customizados</h4>
                  {customFieldsConfig.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label>{field.nome_campo}</Label>
                      {field.tipo === 'textarea' ? (
                        <Textarea
                          value={customData[field.nome_campo] || ''}
                          onChange={(e) => handleCustomChange(field.nome_campo, e.target.value)}
                          className="min-h-[80px]"
                        />
                      ) : field.tipo === 'date' ? (
                        <Input
                          type="date"
                          value={customData[field.nome_campo] || ''}
                          onChange={(e) => handleCustomChange(field.nome_campo, e.target.value)}
                        />
                      ) : field.tipo === 'number' ? (
                        <Input
                          type="number"
                          value={customData[field.nome_campo] || ''}
                          onChange={(e) => handleCustomChange(field.nome_campo, e.target.value)}
                        />
                      ) : (
                        <Input
                          value={customData[field.nome_campo] || ''}
                          onChange={(e) => handleCustomChange(field.nome_campo, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
