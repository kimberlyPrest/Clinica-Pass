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
