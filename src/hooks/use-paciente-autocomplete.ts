import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'

interface Paciente {
  id: string
  nome: string
  telefone: string
}

export function usePacienteAutocomplete(medicoId: string | undefined) {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [filtered, setFiltered] = useState<Paciente[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (!medicoId) return
    pb.collection('pacientes')
      .getFullList<Paciente>({ filter: `medico_id = "${medicoId}"`, sort: 'nome' })
      .then(setPacientes)
      .catch(() => {})
  }, [medicoId])

  const handleNameChange = (val: string, onChangeCb: (v: string) => void) => {
    onChangeCb(val)
    if (val.length > 1) {
      setFiltered(pacientes.filter((p) => p.nome.toLowerCase().includes(val.toLowerCase())))
      setShowSuggestions(true)
    } else {
      setFiltered([])
      setShowSuggestions(false)
    }
  }

  const selectPaciente = (
    p: Paciente,
    setNome: (v: string) => void,
    setTelefone: (v: string) => void,
  ) => {
    setNome(p.nome)
    setTelefone(p.telefone)
    setShowSuggestions(false)
  }

  return {
    pacientes,
    filtered,
    showSuggestions,
    setShowSuggestions,
    handleNameChange,
    selectPaciente,
  }
}
