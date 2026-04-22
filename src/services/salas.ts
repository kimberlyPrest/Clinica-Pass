import pb from '@/lib/pocketbase/client'

export interface Sala {
  id: string
  nome: string
  status: 'ativa' | 'inativa'
  horario_inicio: string
  horario_fim: string
  dias_funcionamento: string[]
  created?: string
  updated?: string
}

export const getSalas = async () => {
  return pb.collection('salas').getFullList<Sala>({ sort: 'nome' })
}

export const getSala = async (id: string) => {
  return pb.collection('salas').getOne<Sala>(id)
}

export const createSala = async (data: any) => {
  return pb.collection('salas').create<Sala>(data)
}

export const updateSala = async (id: string, data: any) => {
  return pb.collection('salas').update<Sala>(id, data)
}

export const deleteSala = async (id: string) => {
  return pb.collection('salas').delete(id)
}

export const getReservasPorSalaDoMes = async (salaId: string, monthStart: Date, monthEnd: Date) => {
  return pb.collection('reservas').getFullList({
    filter: `sala_id = "${salaId}" && data_inicio >= "${monthStart.toISOString()}" && data_inicio <= "${monthEnd.toISOString()}" && status = "ativa"`,
    sort: 'data_inicio',
  })
}

export const getTodasReservasdoMes = async (monthStart: Date, monthEnd: Date) => {
  return pb.collection('reservas').getFullList({
    filter: `data_inicio >= "${monthStart.toISOString()}" && data_inicio <= "${monthEnd.toISOString()}" && status = "ativa"`,
    sort: 'data_inicio',
  })
}

export const getProximaReservaDaSala = async (salaId: string) => {
  const now = new Date()
  const result = await pb.collection('reservas').getList(1, 1, {
    filter: `sala_id = "${salaId}" && data_inicio > "${now.toISOString()}" && status = "ativa"`,
    sort: 'data_inicio',
  })
  return result.items[0] || null
}
