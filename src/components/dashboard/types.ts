export type Period = 'Dia' | 'Semana' | 'Mês'

export interface KpiData {
  occupancyRate: number
  activeDoctors: number
  availableRooms: number
  upcomingAppointments: number
  totalPatients: number
  todayAppointments: number
}

export interface Appointment {
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

export interface DashboardFilters {
  period: Period
}
