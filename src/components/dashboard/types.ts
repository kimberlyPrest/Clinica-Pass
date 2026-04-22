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
  phone: string
  time: string
  doctorName: string
  room: string
  type: string
}

export interface KpiData {
  occupancyRate: number
  activeDoctors: number
  availableRooms: number
  upcomingAppointments: number
}
