import pb from '@/lib/pocketbase/client'

export const getAgendamentosPorMedico = async (medicoId: string) => {
  return pb.collection('agendamentos').getFullList({
    filter: `reserva_id.medico_id = "${medicoId}"`,
    expand: 'reserva_id,reserva_id.sala_id',
    sort: '-hora_inicio',
  })
}
