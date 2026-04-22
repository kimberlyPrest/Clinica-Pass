import pb from '@/lib/pocketbase/client'

export interface Sala {
  id: string
  nome: string
  status: 'ativa' | 'inativa'
  horario_inicio: string
  horario_fim: string
  dias_funcionamento: string[]
  created: string
  updated: string
}

export const getSalas = () => pb.collection('salas').getFullList<Sala>()
export const getSala = (id: string) => pb.collection('salas').getOne<Sala>(id)
export const createSala = (data: Partial<Sala>) => pb.collection('salas').create<Sala>(data)
export const updateSala = (id: string, data: Partial<Sala>) =>
  pb.collection('salas').update<Sala>(id, data)
export const deleteSala = (id: string) => pb.collection('salas').delete(id)
