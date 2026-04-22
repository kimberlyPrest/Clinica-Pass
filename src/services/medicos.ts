import pb from '@/lib/pocketbase/client'

export interface Medico {
  id: string
  usuario_id: string
  nome: string
  especialidade: string
  tipo: 'mensalista' | 'avulso'
  email: string
  telefone: string
  horarios_fixos: any
}

export const getMedicos = () => pb.collection('medicos').getFullList<Medico>()
