import pb from '@/lib/pocketbase/client'

export interface Bloqueio {
  id: string
  sala_id: string
  tipo: 'pontual' | 'diario' | 'semanal' | 'mensal' | 'periodo' | 'recorrencia_complexa'
  data_inicio?: string
  data_fim?: string
  hora_inicio?: string
  hora_fim?: string
  dias_semana?: string[]
  created: string
  updated: string
}

export const getBloqueios = () => pb.collection('bloqueios').getFullList<Bloqueio>()
export const createBloqueio = (data: Partial<Bloqueio>) =>
  pb.collection('bloqueios').create<Bloqueio>(data)
export const updateBloqueio = (id: string, data: Partial<Bloqueio>) =>
  pb.collection('bloqueios').update<Bloqueio>(id, data)
export const deleteBloqueio = (id: string) => pb.collection('bloqueios').delete(id)
