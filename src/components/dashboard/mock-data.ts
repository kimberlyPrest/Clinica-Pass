import { DashboardFilters, Appointment, KpiData } from './types'

export const MOCK_ROOMS = ['Sala 1', 'Sala 2', 'Sala 3']

export const MOCK_DOCTOR_TYPES = ['Mensalista', 'Avulso']

export const generateDashboardData = (filters: DashboardFilters) => {
  const baseAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'João Pereira',
      phone: '(11) 98765-4321',
      time: '09:00',
      doctorName: 'Dr. Carlos Oliveira',
      room: 'Sala 1',
      type: 'Mensalista',
    },
    {
      id: '2',
      patientName: 'Maria Costa',
      phone: '(11) 99876-5432',
      time: '10:00',
      doctorName: 'Dra. Ana Silva',
      room: 'Sala 2',
      type: 'Avulso',
    },
    {
      id: '3',
      patientName: 'Pedro Alves',
      phone: '(11) 97654-3210',
      time: '14:00',
      doctorName: 'Dr. Felipe Santos',
      room: 'Sala 3',
      type: 'Mensalista',
    },
    {
      id: '4',
      patientName: 'Juliana Rocha',
      phone: '(11) 91234-5678',
      time: '15:00',
      doctorName: 'Dr. Carlos Oliveira',
      room: 'Sala 1',
      type: 'Mensalista',
    },
    {
      id: '5',
      patientName: 'Lucas Mendes',
      phone: '(11) 92345-6789',
      time: '16:00',
      doctorName: 'Dra. Ana Silva',
      room: 'Sala 2',
      type: 'Avulso',
    },
    {
      id: '6',
      patientName: 'Mariana Pires',
      phone: '(11) 93456-7890',
      time: '17:00',
      doctorName: 'Dr. Felipe Santos',
      room: 'Sala 3',
      type: 'Mensalista',
    },
  ]

  const filteredAppointments = baseAppointments.filter((app) => {
    if (!filters.rooms.includes(app.room)) return false
    if (!filters.doctorTypes.includes(app.type)) return false
    return true
  })

  const minOcc = filters.occupancy[0]
  const maxOcc = filters.occupancy[1]
  const dynamicOcc = minOcc === maxOcc ? minOcc : Math.floor(minOcc + (maxOcc - minOcc) * 0.8)

  const kpiData: KpiData = {
    occupancyRate: Math.max(0, Math.min(100, dynamicOcc)),
    activeDoctors:
      filters.doctorTypes.length === 2 ? 3 : filters.doctorTypes.includes('Mensalista') ? 2 : 1,
    availableRooms: Math.max(0, 3 - filters.rooms.length),
    upcomingAppointments:
      filteredAppointments.length *
      (filters.period === 'Mês' ? 4 : filters.period === 'Semana' ? 2 : 1),
  }

  const lineChartData = Array.from({ length: 7 }).map((_, i) => {
    const val = minOcc + ((maxOcc - minOcc) * (Math.sin(i * 1.5) + 1)) / 2
    return {
      day: `Dia ${i + 1}`,
      occupancy: Math.min(100, Math.max(0, Math.floor(val))),
    }
  })

  const pieChartData = MOCK_ROOMS.filter((room) => filters.rooms.includes(room)).map((room) => ({
    name: room,
    value: Math.max(
      1,
      filteredAppointments.filter((a) => a.room === room).length * 2 +
        Math.floor(Math.random() * 5),
    ),
  }))

  return { appointments: filteredAppointments, kpiData, lineChartData, pieChartData }
}
