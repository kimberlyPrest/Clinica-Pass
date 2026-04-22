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
export const getMedicoByUserId = async (userId: string) => {
  const records = await pb
    .collection('medicos')
    .getFullList<Medico>({ filter: `usuario_id = "${userId}"` })
  return records[0] || null
}
export const getMedico = (id: string) => pb.collection('medicos').getOne<Medico>(id)
export const createMedico = (data: Partial<Medico>) => pb.collection('medicos').create<Medico>(data)
export const updateMedico = (id: string, data: Partial<Medico>) =>
  pb.collection('medicos').update<Medico>(id, data)
