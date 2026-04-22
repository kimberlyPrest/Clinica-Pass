import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getMedicoByUserId, type Medico } from '@/services/medicos'
import {
  getReservasMedicoPeriodo,
  getConsultasMedicoPeriodo,
  getHistoricoMedico,
  type Reserva,
  type Agendamento,
} from '@/services/agenda'
import { CalendarDays, Clock, User, Phone, Mail, Stethoscope, Play } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [medico, setMedico] = useState<Medico | null>(null)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [consultas, setConsultas] = useState<Agendamento[]>([])
  const [historico, setHistorico] = useState<Agendamento[]>([])

  const loadData = async () => {
    if (!user?.id) return
    try {
      const m = await getMedicoByUserId(user.id)
      setMedico(m)
      if (m) {
        const now = new Date()
        const in7Days = new Date()
        in7Days.setDate(now.getDate() + 7)

        const [res, cons, hist] = await Promise.all([
          getReservasMedicoPeriodo(m.id, now, in7Days),
          getConsultasMedicoPeriodo(m.id, now, in7Days),
          getHistoricoMedico(m.id),
        ])
        setReservas(res)
        setConsultas(cons)
        setHistorico(hist)
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('reservas', loadData)
  useRealtime('agendamentos', loadData)

  if (!medico) return <div className="p-8 text-center">Carregando perfil...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-display font-bold text-primary">Meu Painel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section - 60% */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Próximas Reservas (7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reservas.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Nenhuma reserva agendada nos próximos 7 dias
                  </p>
                  <Button asChild>
                    <Link to="/medico/reservas">Reservar Sala</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {reservas.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-col sm:flex-row justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-primary">
                          Sala: {r.expand?.sala_id?.nome || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(r.data_inicio), 'dd/MM/yyyy HH:mm')} -{' '}
                          {format(new Date(r.data_fim), 'HH:mm')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Editar / Cancelar
                        </Button>
                        <Button size="sm">Agendar Consulta</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Próximas Consultas (7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultas.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Nenhuma consulta agendada nos próximos 7 dias
                  </p>
                  <Button asChild>
                    <Link to="/medico/pacientes">Agendar Consulta</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {consultas.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-col sm:flex-row justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold">{c.paciente_nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(c.hora_inicio), 'dd/MM/yyyy HH:mm')} | Sala:{' '}
                          {c.expand?.reserva_id?.expand?.sala_id?.nome}
                        </p>
                        <Badge
                          variant={c.status === 'confirmado' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          Cancelar/Remarcar
                        </Button>
                        <Button variant="secondary" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Histórico Recente (Últimas 10)</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Sala</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Nenhum histórico encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    historico.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">{h.paciente_nome}</TableCell>
                        <TableCell>{format(new Date(h.hora_inicio), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{format(new Date(h.hora_inicio), 'HH:mm')}</TableCell>
                        <TableCell>{h.expand?.reserva_id?.expand?.sala_id?.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{h.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Right Section - 40% */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-primary text-primary-foreground border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-bold text-xl">{medico.nome}</p>
                <p className="opacity-90 flex items-center gap-2 text-sm mt-1">
                  <Stethoscope className="w-4 h-4" /> {medico.especialidade || 'Clínico Geral'}
                </p>
              </div>
              <div className="pt-2 space-y-1 text-sm opacity-90">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {medico.email || 'Não informado'}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {medico.telefone || 'Não informado'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Acesso: <Badge className="capitalize text-sm">{medico.tipo}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medico.tipo === 'mensalista' ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Horários Fixos:</p>
                  <div className="p-3 bg-muted rounded-md text-sm font-medium">
                    {medico.horarios_fixos ? (
                      <pre className="whitespace-pre-wrap font-sans">
                        {JSON.stringify(medico.horarios_fixos, null, 2)}
                      </pre>
                    ) : (
                      'Seg/Qua/Sex 09:00-12:00 e 14:00-18:00 (Exemplo)'
                    )}
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      Editar / Cancelar Fixos
                    </Button>
                    <Button size="sm">Reservar Mais Horários</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-muted-foreground font-medium flex justify-center items-center gap-2">
                    <Play className="w-4 h-4 text-green-500" /> Livre para reservar
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/medico/reservas">Fazer Nova Reserva</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-3">
            <Button size="lg" className="w-full justify-start h-14 text-base" asChild>
              <Link to="/medico/reservas">
                <CalendarDays className="mr-3 h-5 w-5" /> Minhas Reservas
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full justify-start h-14 text-base"
              asChild
            >
              <Link to="/medico/reservas">
                <DoorOpen className="mr-3 h-5 w-5" /> Reservar Sala Agora
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full justify-start h-14 text-base bg-white"
              asChild
            >
              <Link to="/medico/pacientes">
                <User className="mr-3 h-5 w-5" /> Registrar Pacientes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DoorOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M2 20h3" />
      <path d="M13 20h9" />
      <path d="M10 12v.01" />
      <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z" />
    </svg>
  )
}
