import pb from '@/lib/pocketbase/client'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns'
import type { Period } from '@/components/dashboard/types'

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

function getSalaWorkingMinutesPerDay(sala: any): number {
  const start = timeToMinutes(sala.horario_inicio || '09:00')
  const end = timeToMinutes(sala.horario_fim || '19:00')
  return Math.max(0, end - start)
}

function reservaOverlapWithDay(reserva: any, day: Date): number {
  const dayStart = startOfDay(day)
  const dayEnd = endOfDay(day)
  const resStart = parseISO(reserva.data_inicio)
  const resEnd = parseISO(reserva.data_fim)
  const overlapStart = resStart < dayStart ? dayStart : resStart
  const overlapEnd = resEnd > dayEnd ? dayEnd : resEnd
  return Math.max(0, differenceInMinutes(overlapEnd, overlapStart))
}

function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date()
  if (period === 'Dia') {
    return { start: startOfDay(now), end: endOfDay(now) }
  } else if (period === 'Semana') {
    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    return { start: startOfDay(now), end }
  } else {
    return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export interface DashboardKpiData {
  occupancyRate: number
  activeDoctors: number
  availableRooms: number
  upcomingAppointments: number
}

export interface LineChartPoint {
  day: string
  occupancy: number
}

export interface PieChartPoint {
  name: string
  value: number
  percent: number
}

export interface DashboardAppointment {
  id: string
  patientName: string
  patientPhone: string
  patientInitials: string
  doctorName: string
  date: string
  time: string
  room: string
  status: 'Confirmado' | 'Aguardando' | 'Realizado'
}

export async function getDashboardKpis(period: Period): Promise<DashboardKpiData> {
  const { start, end } = getPeriodRange(period)
  const now = new Date()

  const [reservasAtivas, todasSalas] = await Promise.all([
    pb.collection('reservas').getFullList({
      filter: `status = "ativa" && data_inicio >= "${start.toISOString()}" && data_inicio <= "${end.toISOString()}"`,
    }),
    pb.collection('salas').getFullList({ filter: 'status = "ativa"' }),
  ])

  const totalReservedMinutes = reservasAtivas.reduce((acc: number, r: any) => {
    return acc + differenceInMinutes(parseISO(r.data_fim), parseISO(r.data_inicio))
  }, 0)

  const daysInPeriod = Math.max(1, Math.ceil(differenceInMinutes(end, start) / (60 * 24)))
  const totalAvailableMinutes = todasSalas.reduce((acc: number, s: any) => {
    return acc + getSalaWorkingMinutesPerDay(s) * daysInPeriod
  }, 0)

  const occupancyRate =
    totalAvailableMinutes > 0
      ? Math.min(100, (totalReservedMinutes / totalAvailableMinutes) * 100)
      : 0

  const activeDoctorIds = new Set(reservasAtivas.map((r: any) => r.medico_id))

  const nowStr = now.toISOString()
  const [reservasAgora, proximosAgendamentos] = await Promise.all([
    pb.collection('reservas').getFullList({
      filter: `status = "ativa" && data_inicio <= "${nowStr}" && data_fim >= "${nowStr}"`,
    }),
    pb.collection('agendamentos').getList(1, 1, {
      filter: `hora_inicio >= "${nowStr}" && hora_inicio <= "${new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString()}"`,
    }),
  ])

  const ocupadasAgora = new Set(reservasAgora.map((r: any) => r.sala_id))
  const availableRooms = todasSalas.filter((s: any) => !ocupadasAgora.has(s.id)).length

  return {
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    activeDoctors: activeDoctorIds.size,
    availableRooms,
    upcomingAppointments: proximosAgendamentos.totalItems,
  }
}

export async function getDashboardLineChart(): Promise<LineChartPoint[]> {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const [reservas, salas] = await Promise.all([
    pb.collection('reservas').getFullList({
      filter: `status = "ativa" && data_inicio >= "${start.toISOString()}" && data_fim <= "${end.toISOString()}"`,
    }),
    pb.collection('salas').getFullList({ filter: 'status = "ativa"' }),
  ])

  const totalSalaMinutesPerDay = salas.reduce((acc: number, s: any) => {
    return acc + getSalaWorkingMinutesPerDay(s)
  }, 0)

  if (totalSalaMinutesPerDay === 0) return []

  const days = eachDayOfInterval({ start, end }).filter((d) => d <= now)

  return days.map((day) => {
    const reservedMinutes = reservas.reduce((acc: number, r: any) => {
      return acc + reservaOverlapWithDay(r, day)
    }, 0)
    const occupancy = Math.min(
      100,
      Math.round((reservedMinutes / totalSalaMinutesPerDay) * 100),
    )
    return { day: format(day, 'dd'), occupancy }
  })
}

export async function getDashboardPieChart(): Promise<PieChartPoint[]> {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const reservas = await pb.collection('reservas').getFullList({
    filter: `status = "ativa" && data_inicio >= "${start.toISOString()}" && data_inicio <= "${end.toISOString()}"`,
    expand: 'sala_id',
  })

  const byRoom: Record<string, number> = {}
  for (const r of reservas) {
    const salaNome = (r as any).expand?.sala_id?.nome || 'Sem Sala'
    const minutes = differenceInMinutes(parseISO(r.data_fim as string), parseISO(r.data_inicio as string))
    byRoom[salaNome] = (byRoom[salaNome] || 0) + minutes
  }

  const total = Object.values(byRoom).reduce((a, b) => a + b, 0)
  if (total === 0) return []

  return Object.entries(byRoom).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / total) * 100),
  }))
}

export async function getDashboardAppointments(): Promise<DashboardAppointment[]> {
  const now = new Date()
  const start = new Date(now.getTime() - 24 * 3600 * 1000)
  const end = new Date(now.getTime() + 48 * 3600 * 1000)

  const agendamentos = await pb.collection('agendamentos').getFullList({
    filter: `hora_inicio >= "${start.toISOString()}" && hora_inicio <= "${end.toISOString()}"`,
    expand: 'reserva_id,reserva_id.medico_id,reserva_id.sala_id',
    sort: 'hora_inicio',
  })

  const todayStr = format(now, 'yyyy-MM-dd')
  const tomorrowStr = format(new Date(now.getTime() + 86400000), 'yyyy-MM-dd')

  return agendamentos.map((a: any) => {
    const horaInicio = parseISO(a.hora_inicio)
    const dateStr = format(horaInicio, 'yyyy-MM-dd')
    const dateLabel =
      dateStr === todayStr ? 'Hoje' : dateStr === tomorrowStr ? 'Amanhã' : format(horaInicio, 'dd/MM')

    return {
      id: a.id,
      patientName: a.paciente_nome,
      patientPhone: a.paciente_telefone || '',
      patientInitials: a.paciente_nome
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
      doctorName: a.expand?.reserva_id?.expand?.medico_id?.nome || 'Médico',
      date: dateLabel,
      time: format(horaInicio, 'HH:mm'),
      room: a.expand?.reserva_id?.expand?.sala_id?.nome || 'Sala',
      status:
        a.status === 'confirmado'
          ? 'Confirmado'
          : a.status === 'realizado'
            ? 'Realizado'
            : 'Aguardando',
    }
  })
}
