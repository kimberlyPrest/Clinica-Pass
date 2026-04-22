import { DashboardFilters, Appointment, KpiData } from './types'

export const MOCK_ROOMS = ['Sala 1', 'Sala 2', 'Sala 3']
export const MOCK_DOCTOR_TYPES = ['Mensalista', 'Avulso']

export const generateDashboardData = (filters: DashboardFilters) => {
  const appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'Maria Costa',
      patientInitials: 'MC',
      doctorName: 'Dr. Silva (Cardio)',
      date: 'Hoje',
      time: '14:30',
      room: 'Cons. 04',
      status: 'Confirmado',
    },
    {
      id: '2',
      patientName: 'João Oliveira',
      patientInitials: 'JO',
      doctorName: 'Dra. Ana (Geral)',
      date: 'Hoje',
      time: '15:00',
      room: 'Cons. 01',
      status: 'Aguardando',
    },
    {
      id: '3',
      patientName: 'Roberto Alves',
      patientInitials: 'RA',
      doctorName: 'Dr. Mendes (Orto)',
      date: 'Amanhã',
      time: '09:15',
      room: 'Sala Exame B',
      status: 'Confirmado',
    },
  ]

  const kpiData: KpiData = {
    occupancyRate: 86.4,
    activeDoctors: 24,
    availableRooms: 3,
    upcomingAppointments: 184,
  }

  const lineChartData = [
    { day: '01', occupancy: 40 },
    { day: '05', occupancy: 45 },
    { day: '10', occupancy: 65 },
    { day: '15', occupancy: 50 },
    { day: '20', occupancy: 95 },
    { day: '25', occupancy: 60 },
  ]

  const pieChartData = [
    { name: 'Consultórios', value: 12, percent: 45 },
    { name: 'Salas de Exame', value: 8, percent: 30 },
    { name: 'Procedimentos', value: 7, percent: 25 },
  ]

  return { appointments, kpiData, lineChartData, pieChartData }
}
