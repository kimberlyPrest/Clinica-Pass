import pb from '@/lib/pocketbase/client'

export interface Medico {
  id: string
  user_id: string
  nome: string
  email: string
  telefone: string
  especialidade: string
  tipo: 'mensalista' | 'avulso'
  horarios_fixos: Record<string, string[]>
  created?: string
  updated?: string
}

export const getMedicos = async (page: number = 1, search: string = '') => {
  const filter = search
    ? `nome ~ "${search}" || email ~ "${search}" || especialidade ~ "${search}"`
    : ''
  return pb.collection('medicos').getList<Medico>(page, 10, {
    filter,
    sort: 'nome',
  })
}

export const getMedico = async (id: string) => {
  return pb.collection('medicos').getOne<Medico>(id)
}

export const getMedicoByUserId = async (userId: string) => {
  return pb.collection('medicos').getFirstListItem<Medico>(`user_id = "${userId}"`)
}

export const getAllMedicos = async () => {
  return pb.collection('medicos').getFullList<Medico>({ sort: 'nome' })
}

export const createMedico = async (data: any) => {
  return pb.collection('medicos').create<Medico>(data)
}

export const updateMedico = async (id: string, data: any) => {
  return pb.collection('medicos').update<Medico>(id, data)
}

export const deleteMedico = async (id: string) => {
  return pb.collection('medicos').delete(id)
}
