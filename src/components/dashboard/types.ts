export type Period = 'Dia' | 'Semana' | 'Mês'

export interface DashboardFilters {
  period: Period
  rooms: string[]
  doctorTypes: string[]
  occupancy: number[]
}

export interface Appointment {
  id: string
  patientName: string
  patientInitials: string
  doctorName: string
  date: string
  time: string
  room: string
  status: 'Confirmado' | 'Aguardando'
}

export interface KpiData {
  occupancyRate: number
  activeDoctors: number
  availableRooms: number
  upcomingAppointments: number
}
