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
