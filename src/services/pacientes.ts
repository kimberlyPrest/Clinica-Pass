import pb from '@/lib/pocketbase/client'
import type { Medico } from './medicos'

export interface Paciente {
  id: string
  medico_id: string
  nome: string
  telefone: string
  data_nascimento?: string
  cpf?: string
  email?: string
  endereco?: string
  anamnese?: string
  medicacoes?: string
  notas_internas?: string
  created: string
  updated: string
  expand?: {
    medico_id: Medico
  }
}

export const getPacientes = (medicoId?: string) => {
  const filter = medicoId ? `medico_id = "${medicoId}"` : ''
  return pb.collection('pacientes').getFullList<Paciente>({
    filter,
    sort: 'nome',
    expand: 'medico_id',
  })
}

export const createPaciente = (data: Partial<Paciente>) =>
  pb.collection('pacientes').create<Paciente>(data)
export const updatePaciente = (id: string, data: Partial<Paciente>) =>
  pb.collection('pacientes').update<Paciente>(id, data)
export const deletePaciente = (id: string) => pb.collection('pacientes').delete(id)
