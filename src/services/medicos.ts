import pb from '@/lib/pocketbase/client'

export const getMedicos = async () => {
  return pb.collection('medicos').getFullList({ sort: 'nome' })
}

export const getMedico = async (id: string) => {
  return pb.collection('medicos').getOne(id)
}

export const getMedicoByUserId = async (userId: string) => {
  return pb.collection('medicos').getFirstListItem(`user_id = "${userId}"`)
}

export const createMedico = async (data: any) => {
  return pb.collection('medicos').create(data)
}

export const updateMedico = async (id: string, data: any) => {
  return pb.collection('medicos').update(id, data)
}

export const deleteMedico = async (id: string) => {
  return pb.collection('medicos').delete(id)
}
