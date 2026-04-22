import pb from '@/lib/pocketbase/client'

export const getSalas = async () => {
  return pb.collection('salas').getFullList({ sort: 'nome' })
}
