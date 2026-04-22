import pb from '@/lib/pocketbase/client'

export const getAgendamentosPorMedico = async (medicoId: string) => {
  return pb.collection('agendamentos').getFullList({
    filter: `reserva_id.medico_id = "${medicoId}"`,
    expand: 'reserva_id,reserva_id.sala_id',
    sort: '-hora_inicio',
  })
}

export const getReservasPorMedicoAtivas = async (medicoId: string) => {
  const hoje = new Date().toISOString().split('T')[0]
  return pb.collection('reservas').getFullList({
    filter: `medico_id = "${medicoId}" && status = "ativa" && data_inicio >= "${hoje}"`,
    expand: 'sala_id',
    sort: 'data_inicio',
  })
}

export const getReservas = async () => {
  return pb.collection('reservas').getFullList({
    expand: 'medico_id,sala_id',
    sort: '-data_inicio',
  })
}

export const updateReserva = async (
  id: string,
  data: Partial<{ status: string; data_inicio: string; data_fim: string }>,
) => {
  return pb.collection('reservas').update(id, data)
}

export const createReserva = async (data: any) => {
  return pb.collection('reservas').create(data)
}
