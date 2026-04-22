import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ptBR } from 'date-fns/locale'
import {
  format,
  parseISO,
  differenceInMinutes,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from 'date-fns'
import { ArrowLeft, Edit, Clock, Users, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { getMedico, type Medico } from '@/services/medicos'
import { getAgendamentosPorMedico } from '@/services/reservas'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MedicoFormModal } from '@/components/medicos/MedicoFormModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DAYS = [
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
]
const HOURS = Array.from({ length: 11 }, (_, i) => {
  const h = i + 9
  return `${h < 10 ? '0' : ''}${h}:00`
})

export default function MedicoDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [medico, setMedico] = useState<Medico | null>(null)
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statsPeriod, setStatsPeriod] = useState(new Date())

  const isClinica = user?.tipo_acesso === 'clinica'

  const loadData = async () => {
    if (!id) return
    try {
      const [mRes, aRes] = await Promise.all([getMedico(id), getAgendamentosPorMedico(id)])
      setMedico(mRes)
      setAgendamentos(aRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const stats = useMemo(() => {
    if (!agendamentos.length) return { consultas: 0, pacientes: 0, horas: 0 }

    const start = startOfMonth(statsPeriod)
    const end = endOfMonth(statsPeriod)

    const monthAgendamentos = agendamentos.filter((a) => {
      const date = parseISO(a.hora_inicio)
      return isAfter(date, start) && isBefore(date, end)
    })

    const uniquePacientes = new Set(monthAgendamentos.map((a) => a.paciente_nome))

    const totalMinutes = monthAgendamentos.reduce((acc, a) => {
      return acc + differenceInMinutes(parseISO(a.hora_fim), parseISO(a.hora_inicio))
    }, 0)

    return {
      consultas: monthAgendamentos.length,
      pacientes: uniquePacientes.size,
      horas: Math.round((totalMinutes / 60) * 10) / 10,
    }
  }, [agendamentos, statsPeriod])

  const upcomingBookings = useMemo(() => {
    const now = new Date()
    return agendamentos
      .filter((a) => isAfter(parseISO(a.hora_inicio), now))
      .sort((a, b) => parseISO(a.hora_inicio).getTime() - parseISO(b.hora_inicio).getTime())
      .slice(0, 5)
  }, [agendamentos])

  if (loading) {
    return (
      <div className="p-8 bg-[#f7e6dc] min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    )
  }

  if (!medico) {
    return (
      <div className="p-8 bg-[#f7e6dc] min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto text-center py-16">
          <p className="text-xl text-muted-foreground">Médico não encontrado.</p>
          <Button className="mt-4" asChild>
            <Link to="/medicos">Voltar</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-[#f7e6dc] min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Button variant="ghost" className="text-muted-foreground hover:bg-white/50" asChild>
            <Link to="/medicos">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
          {isClinica && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#05807f] hover:bg-[#05807f]/90 text-white"
            >
              <Edit className="mr-2 h-4 w-4" /> Editar Médico
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-[#05807f]">{medico.nome}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {medico.especialidade || 'Sem especialidade'}
                  </p>
                </div>
                {medico.tipo === 'mensalista' ? (
                  <Badge
                    style={{ backgroundColor: '#05807f' }}
                    className="text-sm text-white hover:bg-[#05807f]/90"
                  >
                    Mensalista
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-sm">
                    Avulso
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Email</p>
                  <p>{medico.email || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Telefone</p>
                  <p>{medico.telefone || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Adicionado em</p>
                  <p>{medico.created ? format(parseISO(medico.created), 'dd/MM/yyyy') : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Desempenho
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setStatsPeriod((d) => subMonths(d, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded min-w-[90px] text-center">
                    {format(statsPeriod, 'MMM yyyy', { locale: ptBR })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setStatsPeriod((d) => addMonths(d, 1))}
                    disabled={statsPeriod >= startOfMonth(new Date())}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                  <CalendarRange className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.consultas}</p>
                  <p className="text-xs text-muted-foreground">Consultas no mês</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-700 rounded-full">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pacientes}</p>
                  <p className="text-xs text-muted-foreground">Pacientes atendidos</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.horas}h</p>
                  <p className="text-xs text-muted-foreground">Horas agendadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule / Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {medico.tipo === 'mensalista' ? 'Grade de Horários Fixos' : 'Próximos Agendamentos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medico.tipo === 'mensalista' ? (
              <div className="overflow-x-auto">
                <div className="min-w-[600px] border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-6 bg-muted p-2 font-medium text-sm text-center">
                    <div>Hora</div>
                    {DAYS.map((d) => (
                      <div key={d.id}>{d.label}</div>
                    ))}
                  </div>
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="grid grid-cols-6 p-2 text-center text-sm items-center hover:bg-muted/10"
                      >
                        <div className="font-medium text-muted-foreground">{hour}</div>
                        {DAYS.map((day) => {
                          const isSelected = (medico.horarios_fixos?.[day.id] || []).includes(hour)
                          return (
                            <div key={`${day.id}-${hour}`} className="flex justify-center">
                              {isSelected ? (
                                <div
                                  className="w-4 h-4 rounded-full bg-[#05807f]"
                                  title="Disponível"
                                ></div>
                              ) : (
                                <div
                                  className="w-4 h-4 rounded-full bg-muted"
                                  title="Indisponível"
                                ></div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum agendamento futuro.
                  </p>
                ) : (
                  upcomingBookings.map((a) => {
                    const d = parseISO(a.hora_inicio)
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-muted p-3 rounded-lg text-center min-w-[60px]">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                              {format(d, 'MMM')}
                            </p>
                            <p className="text-lg font-bold">{format(d, 'dd')}</p>
                          </div>
                          <div>
                            <p className="font-medium">{a.paciente_nome}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {format(d, 'HH:mm')} -{' '}
                              {format(parseISO(a.hora_fim), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {a.expand?.reserva_id?.expand?.sala_id?.nome || 'Sala'}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {agendamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum histórico encontrado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="p-3 font-medium rounded-tl-lg">Data & Hora</th>
                      <th className="p-3 font-medium">Paciente</th>
                      <th className="p-3 font-medium">Telefone</th>
                      <th className="p-3 font-medium">Sala</th>
                      <th className="p-3 font-medium">Duração</th>
                      <th className="p-3 font-medium rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {agendamentos.map((a) => {
                      const start = parseISO(a.hora_inicio)
                      const end = parseISO(a.hora_fim)
                      const dur = differenceInMinutes(end, start)
                      return (
                        <tr key={a.id} className="hover:bg-muted/30">
                          <td className="p-3 whitespace-nowrap">
                            {format(start, 'dd/MM/yyyy HH:mm')}
                          </td>
                          <td className="p-3 font-medium">{a.paciente_nome}</td>
                          <td className="p-3">{a.paciente_telefone || '-'}</td>
                          <td className="p-3">
                            {a.expand?.reserva_id?.expand?.sala_id?.nome || '-'}
                          </td>
                          <td className="p-3">{dur} min</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                a.status === 'realizado'
                                  ? 'default'
                                  : a.status === 'pendente'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className={
                                a.status === 'realizado'
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : ''
                              }
                            >
                              {a.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MedicoFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        medico={medico}
        onSuccess={loadData}
      />
    </div>
  )
}
