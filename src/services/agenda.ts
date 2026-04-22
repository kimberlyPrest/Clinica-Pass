import pb from '@/lib/pocketbase/client'
import type { Medico } from './medicos'
import type { Sala } from './salas'

export interface Reserva {
  id: string
  medico_id: string
  sala_id: string
  data_inicio: string
  data_fim: string
  status: 'ativa' | 'cancelada'
  expand?: {
    medico_id: Medico
    sala_id: Sala
  }
}

export interface Agendamento {
  id: string
  reserva_id: string
  paciente_nome: string
  paciente_telefone: string
  hora_inicio: string
  hora_fim: string
  status: 'confirmado' | 'pendente' | 'realizado'
}

export const getReservas = (start: Date, end: Date) => {
  return pb.collection('reservas').getFullList<Reserva>({
    filter: `data_inicio >= "${start.toISOString()}" && data_inicio <= "${end.toISOString()}" && status = 'ativa'`,
    expand: 'medico_id,sala_id',
  })
}

export const getAgendamentos = (start: Date, end: Date) => {
  return pb.collection('agendamentos').getFullList<Agendamento>({
    filter: `reserva_id.data_inicio >= "${start.toISOString()}" && reserva_id.data_inicio <= "${end.toISOString()}"`,
  })
}

export const createReserva = (data: Partial<Reserva>) =>
  pb.collection('reservas').create<Reserva>(data)
export const updateReserva = (id: string, data: Partial<Reserva>) =>
  pb.collection('reservas').update<Reserva>(id, data)
export const deleteReserva = (id: string) => pb.collection('reservas').delete(id)

export const createAgendamento = (data: Partial<Agendamento>) =>
  pb.collection('agendamentos').create<Agendamento>(data)
