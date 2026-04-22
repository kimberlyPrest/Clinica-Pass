import { useState, useEffect, useMemo } from 'react'
import { getSalas, Sala } from '@/services/salas'
import { getBloqueios, Bloqueio } from '@/services/bloqueios'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Plus, Search } from 'lucide-react'
import { SalaCard } from './components/SalaCard'
import { SalaFormModal } from './components/SalaFormModal'
import { BloqueioFormModal } from './components/BloqueioFormModal'
import { AgendaSala } from './components/AgendaSala'

export default function SalasList() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('todas')
  const [ocupacaoMin, setOcupacaoMin] = useState([0])

  const [modalSala, setModalSala] = useState<{ open: boolean; sala?: Sala }>({ open: false })
  const [modalBloqueio, setModalBloqueio] = useState<{ open: boolean; salaId?: string }>({
    open: false,
  })
  const [agendaSala, setAgendaSala] = useState<{ open: boolean; sala?: Sala }>({ open: false })

  const loadData = async () => {
    try {
      const [s, b] = await Promise.all([getSalas(), getBloqueios()])
      setSalas(s)
      setBloqueios(b)
    } catch (e) {
      console.error('Failed to load data', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('salas', () => loadData())
  useRealtime('bloqueios', () => loadData())

  const mockOcupacao = (nome: string) => {
    if (nome === 'Consultório A') return 65
    if (nome === 'Consultório B') return 78
    if (nome === 'Consultório C') return 52
    return 30
  }

  const filteredSalas = useMemo(() => {
    return salas.filter((s) => {
      const matchSearch = s.nome.toLowerCase().includes(search.toLowerCase())
      const matchStatus = status === 'todas' || s.status === status
      const matchOcupacao = mockOcupacao(s.nome) >= ocupacaoMin[0]
      return matchSearch && matchStatus && matchOcupacao
    })
  }, [salas, search, status, ocupacaoMin])

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Gestão de Salas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie disponibilidade, horários e bloqueios.
          </p>
        </div>
        <Button
          onClick={() => setModalSala({ open: true })}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Sala
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-card p-4 rounded-xl shadow-sm border">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos Status</SelectItem>
              <SelectItem value="ativa">Ativa</SelectItem>
              <SelectItem value="inativa">Inativa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-5 flex flex-col justify-center px-2">
          <span className="text-sm font-medium mb-2 text-muted-foreground">
            Ocupação Mínima: {ocupacaoMin[0]}%
          </span>
          <Slider
            value={ocupacaoMin}
            onValueChange={setOcupacaoMin}
            max={100}
            step={5}
            className="[&_[role=slider]]:bg-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalas.map((sala) => (
          <SalaCard
            key={sala.id}
            sala={sala}
            ocupacao={mockOcupacao(sala.nome)}
            onEdit={() => setModalSala({ open: true, sala })}
            onBlock={() => setModalBloqueio({ open: true, salaId: sala.id })}
            onOpenAgenda={() => setAgendaSala({ open: true, sala })}
          />
        ))}
        {filteredSalas.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Nenhuma sala encontrada com os filtros atuais.
          </div>
        )}
      </div>

      {modalSala.open && (
        <SalaFormModal
          open={modalSala.open}
          sala={modalSala.sala}
          bloqueios={bloqueios.filter((b) => b.sala_id === modalSala.sala?.id)}
          onOpenChange={(op) => setModalSala({ open: op })}
          onAddBlock={(salaId) => setModalBloqueio({ open: true, salaId })}
        />
      )}

      {modalBloqueio.open && modalBloqueio.salaId && (
        <BloqueioFormModal
          open={modalBloqueio.open}
          salaId={modalBloqueio.salaId}
          onOpenChange={(op) => setModalBloqueio({ open: op })}
        />
      )}

      {agendaSala.open && agendaSala.sala && (
        <AgendaSala
          open={agendaSala.open}
          sala={agendaSala.sala}
          onOpenChange={(op) => setAgendaSala({ open: op })}
        />
      )}
    </div>
  )
}
