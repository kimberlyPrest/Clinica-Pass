import pb from '@/lib/pocketbase/client'

export interface Sala {
  id: string
  nome: string
  status: 'ativa' | 'inativa'
  horario_inicio: string
  horario_fim: string
  dias_funcionamento: any
}

export const getSalas = () => pb.collection('salas').getFullList<Sala>()
export const createSala = (data: Partial<Sala>) => pb.collection('salas').create<Sala>(data)
export const updateSala = (id: string, data: Partial<Sala>) =>
  pb.collection('salas').update<Sala>(id, data)
