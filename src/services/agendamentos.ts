import pb from '@/lib/pocketbase/client'

export const getAgendamentos = async () => {
  return pb.collection('agendamentos').getFullList({
    expand: 'reserva_id',
  })
}

export const getAgendamentosPorReserva = async (reservaId: string) => {
  return pb.collection('agendamentos').getFullList({
    filter: `reserva_id = "${reservaId}"`,
    sort: 'hora_inicio',
  })
}

export const createAgendamento = async (data: any) => {
  return pb.collection('agendamentos').create(data)
}

export const updateAgendamento = async (id: string, data: any) => {
  return pb.collection('agendamentos').update(id, data)
}

export const deleteAgendamento = async (id: string) => {
  return pb.collection('agendamentos').delete(id)
}
