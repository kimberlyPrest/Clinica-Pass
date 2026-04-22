import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface Medico extends RecordModel {
  usuario_id: string
  nome: string
  especialidade?: string
  tipo?: 'mensalista' | 'avulso'
  email?: string
  telefone?: string
  horarios_fixos?: Record<string, string[]>
}

export const getMedicos = async (page = 1, search = '') => {
  const filterTokens = search
    ? `(nome ~ "${search}" || email ~ "${search}" || especialidade ~ "${search}")`
    : ''

  return pb.collection('medicos').getList<Medico>(page, 10, {
    filter: filterTokens,
    sort: '-created',
  })
}

export const getMedico = async (id: string) => {
  return pb.collection('medicos').getOne<Medico>(id)
}

export const createMedico = async (data: any) => {
  const user = await pb.collection('users').create({
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    name: data.nome,
    tipo_acesso: 'medico',
  })

  return pb.collection('medicos').create({
    usuario_id: user.id,
    nome: data.nome,
    especialidade: data.especialidade,
    tipo: data.tipo,
    email: data.email,
    telefone: data.telefone,
    horarios_fixos: data.horarios_fixos,
  })
}

export const updateMedico = async (id: string, data: any) => {
  return pb.collection('medicos').update(id, {
    nome: data.nome,
    especialidade: data.especialidade,
    tipo: data.tipo,
    telefone: data.telefone,
    horarios_fixos: data.horarios_fixos,
  })
}

export const deleteMedico = async (id: string) => {
  return pb.collection('medicos').delete(id)
}
