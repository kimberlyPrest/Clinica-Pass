import pb from '@/lib/pocketbase/client'

export const getMedicos = async () => {
  return pb.collection('medicos').getFullList({ sort: 'nome' })
}
