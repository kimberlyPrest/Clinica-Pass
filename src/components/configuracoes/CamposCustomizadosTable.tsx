import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CamposCustomizadosTable() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [fields, setFields] = useState<any[]>([])
  const [deletedFields, setDeletedFields] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [medicos, setMedicos] = useState<any[]>([])
  const [selectedMedico, setSelectedMedico] = useState<string>('')

  useEffect(() => {
    if (user?.tipo_acesso === 'clinica') {
      pb.collection('medicos')
        .getFullList()
        .then((data) => {
          setMedicos(data)
          if (data.length > 0) setSelectedMedico(data[0].id)
        })
    } else if (user?.tipo_acesso === 'medico') {
      pb.collection('medicos')
        .getFirstListItem(`usuario_id="${user.id}"`)
        .then((m) => {
          setSelectedMedico(m.id)
        })
    }
  }, [user])

  useEffect(() => {
    if (selectedMedico) {
      loadFields(selectedMedico)
    }
  }, [selectedMedico])

  const loadFields = async (mId: string) => {
    try {
      setLoading(true)
      const data = await pb
        .collection('medico_campos_customizados')
        .getFullList({ filter: `medico_id="${mId}"`, sort: 'ordem' })
      if (data.length === 0) {
        const defaults = [
          { nome_campo: 'Anamnese', tipo: 'textarea', ativo: true, ordem: 1 },
          { nome_campo: 'Medicações', tipo: 'textarea', ativo: true, ordem: 2 },
          { nome_campo: 'Notas Internas', tipo: 'textarea', ativo: true, ordem: 3 },
          { nome_campo: 'Retorno Agendado', tipo: 'date', ativo: true, ordem: 4 },
          { nome_campo: 'Histórico', tipo: 'textarea', ativo: true, ordem: 5 },
        ]
        setFields(defaults.map((d) => ({ ...d, id: 'new-' + Math.random() })))
      } else {
        setFields(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      for (const id of deletedFields) {
        await pb.collection('medico_campos_customizados').delete(id)
      }
      setDeletedFields([])

      for (const field of fields) {
        const payload = {
          medico_id: selectedMedico,
          nome_campo: field.nome_campo,
          tipo: field.tipo,
          ativo: field.ativo,
          ordem: Number(field.ordem),
        }
        if (field.id.startsWith('new-')) {
          await pb.collection('medico_campos_customizados').create(payload)
        } else {
          await pb.collection('medico_campos_customizados').update(field.id, payload)
        }
      }
      toast({ title: 'Campos customizados salvos com sucesso!' })
      loadFields(selectedMedico)
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const updateField = (id: string, key: string, value: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)))
  }

  const handleDelete = (id: string) => {
    if (!id.startsWith('new-')) {
      setDeletedFields([...deletedFields, id])
    }
    setFields(fields.filter((f) => f.id !== id))
    toast({
      title: 'Campo removido',
      description: 'Clique em salvar para confirmar as alterações.',
    })
  }

  const addField = () => {
    setFields([
      ...fields,
      {
        id: 'new-' + Math.random(),
        nome_campo: 'Novo Campo',
        tipo: 'text',
        ativo: true,
        ordem: fields.length + 1,
      },
    ])
  }

  return (
    <div className="space-y-6">
      {user?.tipo_acesso === 'clinica' && (
        <div className="w-64">
          <label className="text-sm font-medium mb-1 block">Selecione o Médico</label>
          <Select value={selectedMedico} onValueChange={setSelectedMedico}>
            <SelectTrigger>
              <SelectValue />
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

      <div className="space-y-4">
        {fields.map((f) => (
          <div
            key={f.id}
            className="flex flex-wrap items-center gap-4 bg-muted/20 p-3 rounded-lg border"
          >
            <Switch checked={f.ativo} onCheckedChange={(v) => updateField(f.id, 'ativo', v)} />
            <div className="flex-1 min-w-[200px]">
              <Input
                value={f.nome_campo}
                onChange={(e) => updateField(f.id, 'nome_campo', e.target.value)}
                placeholder="Nome do Campo"
              />
            </div>
            <div className="w-40">
              <Select value={f.tipo} onValueChange={(v) => updateField(f.id, 'tipo', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto Curto</SelectItem>
                  <SelectItem value="textarea">Texto Longo</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-20">
              <Input
                type="number"
                value={f.ordem}
                onChange={(e) => updateField(f.id, 'ordem', e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDelete(f.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={addField}>
          + Adicionar Campo
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
        >
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
