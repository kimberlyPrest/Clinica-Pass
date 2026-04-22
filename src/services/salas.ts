import pb from '@/lib/pocketbase/client'

export const getSalas = async () => {
  return pb.collection('salas').getFullList({ sort: 'nome' })
}

export const getSala = async (id: string) => {
  return pb.collection('salas').getOne(id)
}

export const createSala = async (data: any) => {
  return pb.collection('salas').create(data)
}

export const updateSala = async (id: string, data: any) => {
  return pb.collection('salas').update(id, data)
}

export const deleteSala = async (id: string) => {
  return pb.collection('salas').delete(id)
}
